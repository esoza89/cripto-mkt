"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "../components/Header"
import Token from "../components/Token"

// ABIs & Config
import Factory from "../abis/Factory.json"
import config from "../config.json"
import images from "../images.json"

export function ListaMaestra() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [fee, setFee] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [tokens, setTokens] = useState([])
  const [token, setToken] = useState(null)


  async function loadBlockchainData() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.getAddress(accounts[0])
      const signer = await provider.getSigner()
      setAccount(account)
      const factoryAddress = config[network.chainId].factory.address
      const factory = new ethers.Contract(factoryAddress, Factory, provider)
      setFactory(factory)

      const totalTokens = await factory.totalTokens()
      const totalTokensNumber = Number(totalTokens)
      console.log(`total tokens ${totalTokens}`)
      const tokens = []
      
      for (let i = totalTokensNumber-1; i >= 0; i--) {
        const tokenSale = await factory.getTokenSale(i)

        const token = {
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: tokenSale.sold,
          raised: tokenSale.raised,
          isOpen: tokenSale.isOpen,
          image: images[i],
          fId: i
        }
      
        tokens.push(token)
      }

      setTokens(tokens)

    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>

        <div className="listings">
          <h1>Lista maestra de monedas</h1>
            <div className="tokens">
              {!account ? (
                <p>conecta la cuenta</p>
              ) : tokens.length === 0 ? (
                <p>no hay meme monedas</p>
              ) : (
                tokens.map((token, index) => (
                  <Token
                    token={token}
                    key={index}
                  />
                ))
              )}
            </div>
        </div>

      </main>

    </div>
  );
}

export default ListaMaestra;