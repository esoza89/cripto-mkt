import { useEffect, useState } from "react"
import { ethers } from "ethers"

function Trade({ toggleTrade, token, provider, factory }) {
  const [target, setTarget] = useState(0)
  const [limit, setLimit] = useState(0)
  const [price, setPrice] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  async function buyHandler(form) {
    const amount = ethers.parseUnits(form.get("amount"), 18)
    const sold = token.sold
    console.log(sold)
    const price = await factory.getPrice(sold)
    const totalCost = await factory.getCost(sold, amount)
    console.log(totalCost)

    const signer = await provider.getSigner()

    const transaction = await factory.connect(signer).buy(
      token.token,
      amount,
      { value: totalCost }
    )

    await transaction.wait()

    toggleTrade()

  }

  async function getSaleDetails() {
    const target = await factory.TARGET()
    setTarget(target)

    const limit = await factory.TOKEN_LIMIT()
    setLimit(limit)

    const price = await factory.getPrice(token.sold)
    setPrice(price)
  }

  useEffect(() => {
    getSaleDetails()
  }, [])

  return (
    <div className="trade">
      <h1>compra / vende</h1>

      <div className="token__details">
        <img src={token.image} alt="token image" width={256} height={256} />
        <p>created by {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>Market Cap: {Number(ethers.formatUnits(token.raised, 18)).toFixed(6)} ETH</p>
        <p>base price: {ethers.formatUnits(price, 18)} ETH</p>
        <p className="name">{token.name}</p>
      </div>

      {token.sold >= limit || token.raised >= target ? (
        <p className="disclaimer">¡Objetivo alcanzado!</p>
      ) : (
        <form action={buyHandler}>
          <input type="number" name="amount" min={1} max={800000000} placeholder="1"/>
          <input type="submit" value="[ comprar ]" />
        </form>
      )}

      <button onClick={toggleTrade} className="btn--fancy">[ cancelar ]</button>
    </div >
  );
}

export default Trade;