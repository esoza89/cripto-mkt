"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Token from "../abis/Token.json"
import config from "../config.json"
import Factory from "../abis/Factory.json"
import images from "../images.json"

export function Trade() {
  const [target, setTarget] = useState(0)
  const [limit, setLimit] = useState(0)
  const [price, setPrice] = useState(0)
  const [amountBValue, setAmountBValue] = useState(1)
  const [amountSValue, setAmountSValue] = useState(1)
  const [totalCostB, setTotalCostB] = useState(0)
  const [totalCostS, setTotalCostS] = useState(0)
  const [toastB, setToastB] = useState(null);
  const [toastS, setToastS] = useState(null);
  let [tokenFid, setTokenFid] = useState(0);
  let [token, setToken] = useState(null);
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [isLoading, setIsLoading] = useState(true);


  const stimateCostB = async (event) => {
    console.log(token.sold)
    console.log(event.target.value)
    setAmountBValue(event.target.value)
    const amountB = ethers.parseUnits(event.target.value, 18)
    const cost = await factory.getCost(token.sold, amountB)
    console.log(cost)
    setTotalCostB(cost)
  }

  const stimateCostS = async (event) => {
    console.log(token.sold)
    console.log(event.target.value)
    setAmountSValue(event.target.value)
    const amountS = ethers.parseUnits(event.target.value, 18)
    const cost = await factory.getCost(token.sold, amountS)
    console.log(cost)
    setTotalCostS(cost)
  }


  async function buyHandler(form) {
    const amountB = ethers.parseUnits(form.get("amountB"), 18)

    if(token.sold + amountB > limit) {
      setToastB("No hay suficientes tokens en existencia");
      setTimeout(() => setToastB(null), 3000);
      return;
    }
    const signer = await provider.getSigner()
    const userBalance = await provider.getBalance(signer)
    console.log(userBalance)

    const sold = token.sold
    const totalCost = await factory.getCost(sold, amountB)

    if(userBalance < totalCost) {
      setToastB("No cuentas con ETH suficiente");
      setTimeout(() => setToastB(null), 3000);
      return;
    }

    const transaction = await factory.connect(signer).buy(
      token.token,
      amountB,
      { value: totalCost }
    )

    setToastB("Procesando compra...");
    setTimeout(() => setToastB(null), 3000);

    await transaction.wait()

  }

  async function sellHandler(form) {
    const amountS = ethers.parseUnits(form.get("amountS"), 18)

    if(token.sold - amountS < 0 ) {
      setToastS("No hay suficientes tokens vendidos");
      setTimeout(() => setToastS(null), 3000);
      return;
    }
    const signer = await provider.getSigner()
    const network = await provider.getNetwork()

    const userBalance = await factory.balances(token.token, signer)
    if(userBalance < amountS) {
      setToastS("No tienes suficientes tokens para vender");
      setTimeout(() => setToastS(null), 3000);
      return;
    }

    const sold = token.sold
    console.log(sold)

    const factoryAddress = config[network.chainId].factory.address

    const tokenContract = new ethers.Contract(
      token.token, 
      Token, 
      signer
    );
    
    const approveTx = await tokenContract.approve(
      factoryAddress, 
      amountS
    );

    await approveTx.wait();


    const transaction = await factory.connect(signer).sell(
      token.token,
      amountS
    )

    setToastS("Procesando venta...");
    setTimeout(() => setToastS(null), 3000);

    await transaction.wait()

  }

  async function getSaleDetails() {
    try {
        const storedData = localStorage.getItem('tradeData');
        const parsedData = JSON.parse(storedData);
        const gotToken = parsedData.tokenFid;
        tokenFid = gotToken
        setTokenFid(gotToken)
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        console.log("check one")
        const network = await provider.getNetwork()
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.getAddress(accounts[0])
        const signer = await provider.getSigner()
        setAccount(account)
        const factoryAddress = config[network.chainId].factory.address
        const factory = new ethers.Contract(factoryAddress, Factory, provider)
        setFactory(factory)
        const targetD = await factory.getTarget()
        //const targetD = 0
        setTarget(targetD)
        console.log(`check two ${targetD}`)

        const limitD = await factory.getTokenLimit()
        setLimit(limitD)
        console.log(`check three ${limitD}`)

        //const tokenSale = await factory.getTokenSale(tokenFid)
        let tokenSale = await factory.getTokenSale(tokenFid)
        console.log(`check five ${tokenSale.name}`)

        token = {
            token: tokenSale.token,
            name: tokenSale.name,
            creator: tokenSale.creator,
            sold: tokenSale.sold,
            raised: tokenSale.raised,
            isOpen: tokenSale.isOpen,
            image: images[tokenFid],
            fId: tokenFid
        }
        setToken(token)
        const priceD = await factory.getPrice(token.sold)
        setPrice(priceD)

    } catch (error) {
    console.error("Error fetching sale details:", error);
    } finally {
    setIsLoading(false);
    }

  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getSaleDetails();
    }
  }, []);

  if (isLoading) {
    return <div>Loading token details...</div>;
  }
  
  if (!token) {
    return <div>Token not found</div>;
  }

  return (
    <div className="trade">
      <h1>trade</h1>

      <div className="token__details">
        <img src={token.image} alt="token image" width={156} height={156} />
        <p>creado por {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>Market Cap: {Number(ethers.formatUnits(token.raised, 18)).toFixed(18)} ETH</p>
        <p>Precio base: {ethers.formatUnits(price, 18)} ETH</p>
        <p className="name">{token.name}</p>
      </div>

      {token.sold >= limit || token.raised >= target ? (
        <div>
          <p className="disclaimer">¡Objetivo alcanzado!</p>
          <p>
              <a 
                href={`https://app.uniswap.org/explore/tokens/unichain/${token.token}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link"
              >   
              Ver en Uniswap
              </a>
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <h3>Compra</h3>
            <form action={buyHandler}>
              <input type="number" name="amountB" min={1} max={limit} placeholder="1" value={amountBValue} onChange={stimateCostB}/>
              <input type="submit" value="[ comprar ]" />
            </form>
            <div className="trade__cost">
              <p>{Number(ethers.formatUnits(totalCostB, 18)).toFixed(18)} ETH</p>
            </div>
            {toastB && (
              <div className="toast">
                {toastB}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <h3>Vende</h3>
            <form action={sellHandler}>
              <input type="number" name="amountS" min={1} max={limit} placeholder="1" value={amountSValue} onChange={stimateCostS}/>
              <input type="submit" value="[ vender ]" />
            </form>
            <div className="trade__cost">
              <p>{Number(ethers.formatUnits(totalCostS, 18)).toFixed(18)} ETH</p>
            </div>
            {toastS && (
              <div className="toast">
                {toastS}
              </div>
            )}
          </div>
        </div>
      )}
    </div >
  );
}

export default Trade;