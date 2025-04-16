'use client'
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from 'react-redux';
import { addToken } from '../store/tokensSlice';


function List({ toggleCreate, fee, provider, factory }) {
  const dispatch = useDispatch();

  const [toastC, setToastC] = useState(null);

  async function listHandler(form) {

    const name = form.get("name")
    const symbol = form.get("symbol")
    const image = form.get("imageURL")
    const creatorMessage = form.get("creatorMessage")
    const rSocial1 = form.get("rSocial1")
    const rSocial2 = form.get("rSocial2")

    if (name && symbol && image && creatorMessage) {
      const signer = await provider.getSigner()
      const transaction = await factory.connect(signer).create(name, symbol, { value: fee })
      setToastC("Creando meme moneda...");
      setTimeout(() => setToastC(null), 3000);
      await transaction.wait()
      const totalTokens = await factory.totalTokens()
      const tokenID = Number(totalTokens) - 1
      dispatch(
        addToken({
          id: tokenID,
          imageURL: image,
          creatorMessage: creatorMessage,
          socialMediaLinks: {
            rSocial1: rSocial1,
            rSocial2: rSocial2,
          },
          comments: [],
        })
      );

      toggleCreate()
    }
  }

  return (
    <div className="list">
      <h2>Crear una meme moneda</h2>

      <div className="list_description">
        <p>Comision: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form action={listHandler}>
        <input type="text" name="name" placeholder="nombre" />
        <input type="text" name="symbol" placeholder="simbolo" />
        <input type="text" name="imageURL" placeholder="imagen URL" />
        <input type="text" name="creatorMessage" placeholder="mensaje del creador" />
        <input type="text" name="rSocial1" placeholder="red social (opcional)" />
        <input type="text" name="rSocial2" placeholder="red social 2 (opcional)" />
        <input type="submit" value="[ Crear ]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">[ cancelar ]</button>
      {toastC && (
        <div className="toast">
          {toastC}
        </div>
      )}
    </div>
  );
}

export default List;