"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'
import { useSelector} from 'react-redux';

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"

export default function Home() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [fee, setFee] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [tokens, setTokens] = useState([])
  const [tokensTop, setTokensTop] = useState([])
  const [token, setToken] = useState(null)
  const [showTrade, setShowTrade] = useState(false)

  const tokensState = useSelector((state) => state.tokens.tokens);

  async function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true)
  }

  const openInNewTab = () => {
    window.open('/ListaMaestra', '_blank', 'noopener,noreferrer');
  };

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
      const totalTokensNumber = Number(totalTokens)
      console.log(`total tokens ${totalTokens}`)
      const tokens = []
      const startIndex = Math.min(totalTokensNumber - 1, 49)
      
      for (let i = startIndex; i >= 0 && i >= totalTokensNumber - 50; i--) {
        console.log(`token ${i}`)
        console.log(`tokenStateID ${tokensState[i]?.id}`)
        const tokenSale = await factory.getTokenSale(i)

        const token = {
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: tokenSale.sold,
          raised: tokenSale.raised,
          isOpen: tokenSale.isOpen,
          image: tokensState[i]?.imageURL,
          fId: i
        }
      
        tokens.push(token)
      }

      setTokens(tokens)

      const sortedTokens = [...tokens].sort((a, b) => {
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        
        if (b.sold > a.sold) return 1;
        if (b.sold < a.sold) return -1;
        
        return 0;
      });
    
      const top5Tokens = sortedTokens.slice(0, 5);
      setTokensTop(top5Tokens);

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
          <h1>monedas en tendencia</h1>
            <div className="tokens">
              {!account ? (
                <p>conecta la cuenta</p>
              ) : tokensTop.length === 0 ? (
                <p>no hay meme monedas</p>
              ) : (
                tokensTop.map((token, index) => (
                  <Token
                    token={token}
                    key={index}
                  />
                ))
              )}
            </div>
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
                    token={token}
                    key={index}
                  />
                ))
              )}
            </div>
        </div>

        <div className="create">
          <button onClick={openInNewTab} className="btn--fancy">
            [ todas las monedas ]
          </button>
        </div>

      </main>

      { showCreate && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
      )}


    </div>
  );
}
