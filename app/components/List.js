import { ethers } from "ethers"

function List({ toggleCreate, fee, provider, factory }) {

  async function listHandler(form) {

    const name = form.get("name")
    const symbol = form.get("symbol")

    if (name && symbol) {
      const signer = await provider.getSigner()
      const developer = await factory.developer()
      const transaction = await factory.connect(signer).create(name, symbol, developer, { value: fee })
      await transaction.wait()

      toggleCreate()
    }
  }

  return (
    <div className="list">
      <h2>Crear una meme moneda</h2>

      <div className="list_description">
        <p>fee: {ethers.formatUnits(fee, 18)} ETH</p>
      </div>

      <form action={listHandler}>
        <input type="text" name="name" placeholder="nombre" />
        <input type="text" name="symbol" placeholder="simbolo" />
        <input type="submit" value="[ list ]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">[ cancelar ]</button>
    </div>
  );
}

export default List;