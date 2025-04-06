"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"
import images from "./images.json"

export default function Home() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [fee, setFee] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [tokens, setTokens] = useState([])
  const [token, setToken] = useState(null)
  const [showTrade, setShowTrade] = useState(false)

  async function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true)
  }

  async function toggleTrade(token) {
    setToken(token)
    showTrade ? setShowTrade(false) : setShowTrade(true)
  }

  async function loadBlockchainData() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      const factoryAddress = config[network.chainId].factory.address
      const factory = new ethers.Contract(factoryAddress, Factory, provider)
      setFactory(factory)

      const fee = await factory.fee()
      setFee(fee)

      const totalTokens = await factory.totalTokens()
      console.log(`total tokens ${totalTokens}`)
      const tokens = []
      
      for (let i = 0; i < totalTokens; i++) {
        if (i == 50) break

        const tokenSale = await factory.getTokenSale(i)

        const token = {
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: tokenSale.sold,
          raised: tokenSale.raised,
          isOpen: tokenSale.isOpen,
          image: images[i]
        }
      
        tokens.push(token)
      }

      setTokens(tokens.reverse())

    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">
            {!factory ? (
              "[ conecta la billetera ]"
            ) : !account ? (
              "[ conecta la billetera ]"
            ) : (
              "[ crea una meme moneda ]"
            )}
          </button>
        </div>

        <div className="listings">
          <h1>nuevas monedas</h1>
            <div className="tokens">
              {!account ? (
                <p>conecta la cuenta</p>
              ) : tokens.length === 0 ? (
                <p>no hay meme monedas</p>
              ) : (
                tokens.map((token, index) => (
                  <Token
                    toggleTrade={toggleTrade}
                    token={token}
                    key={index}
                  />
                ))
              )}
            </div>
        
        </div>

      </main>

      { showCreate && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
      )}

      { showTrade && (
        <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory} />
      )}

    </div>
  );
}
