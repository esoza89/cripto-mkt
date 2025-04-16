"use client"


import { ethers } from "ethers"

function Token({ token }) {

  const openInNewTab = () => {
    const tokenFid = token.fId
    localStorage.setItem('tradeData', JSON.stringify({tokenFid}));
    window.open('/Trade', '_blank', 'noopener,noreferrer');
  };

  return (
    <button onClick={openInNewTab} className="token">
      <div className="token__details">
        <img src={token.image} alt="token image" width={125} height={125} />
        <p>created by {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>Market Cap: {ethers.formatUnits(token.raised, 18)} ETH</p>
        {token.name}
      </div>
    </button>
  );
}

export default Token;