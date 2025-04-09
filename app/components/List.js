import { ethers } from "ethers"
import { useEffect, useState } from "react"


function List({ toggleCreate, fee, provider, factory }) {
    const [toastC, setToastC] = useState(null);

  async function listHandler(form) {

    const name = form.get("name")
    const symbol = form.get("symbol")

    if (name && symbol) {
      const signer = await provider.getSigner()
      const transaction = await factory.connect(signer).create(name, symbol, { value: fee })
      setToastC("Creando meme moneda...");
      setTimeout(() => setToastC(null), 3000);
      await transaction.wait()

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