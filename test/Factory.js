const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", 18)


    async function deployFactoryFixture() {
        const [deployer, creator, buyer] = await ethers.getSigners()

        const Factory = await ethers.getContractFactory("Factory")
        const factory = await Factory.deploy(FEE)
        
        const transaction = await factory.connect(creator).create("Fabrica de Memes", "FDM", deployer.address, { value: FEE })
        await transaction.wait()

        const tokenAddress = await factory.tokens(0)
        const token = await ethers.getContractAt("Token", tokenAddress)

        return { factory, token, deployer, creator, buyer }
    }

    async function buyTokenFixture() {
        const { factory, token, creator, buyer } = await loadFixture(deployFactoryFixture)
        
        const AMOUNT = ethers.parseUnits("1000000", 18)
        const COST = ethers.parseUnits("0.012514085807898666", 18)

        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
        await transaction.wait()

        return { factory, token, creator, buyer }
    }

    describe("Deployment", function () {
        it("Should set the fee", async function () {
        const { factory } = await loadFixture(deployFactoryFixture)
        expect(await factory.fee()).to.equal(FEE)
        })

        it("Should set the factory owner", async function () {
        const { factory, deployer } = await loadFixture(deployFactoryFixture)
        expect(await factory.developer()).to.equal(deployer.address)
        })
    })

    describe("Creating", function () {
        it("Should set the token owner", async function () {
          const { factory, token } = await loadFixture(deployFactoryFixture)
          expect(await token.owner()).to.equal(await factory.getAddress())
        })
    
        it("Should set the creator", async function () {
          const { token, creator } = await loadFixture(deployFactoryFixture)
          expect(await token.creator()).to.equal(creator.address)
        })

        it("Should allocate 10 million tokens to developer", async function() {
            const { token, deployer } = await loadFixture(deployFactoryFixture)
            expect(await token.balanceOf(deployer.address)).to.equal(ethers.parseUnits("10000000", 18))
        })
    
        it("Should set the supply", async function () {
          const { factory, token } = await loadFixture(deployFactoryFixture)
    
          const totalSupply = ethers.parseUnits("1000000000", 18)
          const totalSupplyCorr = totalSupply - ethers.parseUnits("10000000", 18)
    
          expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupplyCorr)
        })
    
        it("Should update ETH balance", async function () {
          const { factory } = await loadFixture(deployFactoryFixture)
    
          const balance = await ethers.provider.getBalance(await factory.getAddress())
    
          expect(balance).to.equal(FEE)
        })

        it("should create the sale", async function () {
            const { factory, creator } = await loadFixture(deployFactoryFixture)
            const count = await factory.totalTokens()
            expect(count).to.equal(1)

            const sale = await factory.getTokenSale(0)
            expect(sale.name).to.equal("Fabrica de Memes")
            expect(sale.creator).to.equal(creator.address)
            expect(sale.sold).to.equal(0)
            expect(sale.raised).to.equal(0)
            expect(sale.isOpen).to.equal(true)
        })
    
    })
    
    describe("Buying", function() {
        const AMOUNT = ethers.parseUnits("1000000", 18)
        const COST = ethers.parseUnits("0.012514085807898666", 18)

        it("Should update ETH balance", async function() {
            const { factory } = await loadFixture(buyTokenFixture)
            const balance = await ethers.provider.getBalance(await factory.getAddress())
            expect(balance).to.equal(FEE + COST)
        })

        it("Should update buyer balance", async function() {
            const { factory, token, buyer } = await loadFixture(buyTokenFixture)
            expect(await token.balanceOf(buyer.address)).to.equal(AMOUNT)

            const mappingBalance = await factory.balances(token.getAddress(), buyer.address)
            expect(mappingBalance).to.equal(AMOUNT)
        })

        it("Should update token sale registry", async function() {
            const { factory } = await loadFixture(buyTokenFixture)
            const sale = await factory.getTokenSale(0)

            expect(sale.sold).to.equal(AMOUNT)
            expect(sale.raised).to.equal(COST)
            expect(sale.isOpen).to.equal(true)
        })

        it("should increase the base cost", async function() {
            const { factory, token } = await loadFixture(buyTokenFixture)
            const sale = await factory.getTokenSale(0)
            const price = await factory.getPrice(sale.sold)
            const cost = await factory.getCost(0, AMOUNT)
            //console.log(`Cost in test ${ethers.formatUnits(cost, 18)} ETH`)
            // console.log(`Amount quoted ${ethers.formatUnits(sale.sold, 18)} ETH`)
            // console.log(`Price ${ethers.formatUnits(price, 18)} ETH`)
            expect(price).to.equal(ethers.parseUnits("0.000000012528177871", 18))
        })

    })

    describe("Depositing", function() {
        const AMOUNT = ethers.parseUnits("799000000", 18)
        const COST = ethers.parseUnits("22.201419311525434667", 18)


        it("should close the sale and successfully deposit", async function () {
            const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture)

            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
            await buyTx.wait()

            const sale  = await factory.tokenToSale(await token.getAddress())
            expect(sale.isOpen).to.equal(false)

            const depositTx = await factory.connect(creator).deposit(await token.getAddress())
            await depositTx.wait()

            const balance = await token.balanceOf(creator.address)
            expect(balance).to.equal(ethers.parseUnits("190000000", 18))
            const ethBalanceRaw = await ethers.provider.getBalance(creator.address)
            // console.log(`${ethers.formatEther(ethBalanceRaw)} ETH`)

            expect(ethBalanceRaw).to.be.above(ethers.parseUnits("10000", 18))
        })
    })

    describe("Withdrawing Fees", function() {
        it("should update deployer ETH balance", async function () {
            const { factory, deployer } = await loadFixture(deployFactoryFixture)

            const transaction = await factory.connect(deployer).withdraw()
            await transaction.wait()

            const balance = await ethers.provider.getBalance(await factory.getAddress())
            expect(balance).to.equal(0)

            const ethBalanceRaw = await ethers.provider.getBalance(deployer.address)
            // console.log(`${ethers.formatEther(ethBalanceRaw)} ETH`)
            expect(ethBalanceRaw).to.be.above(ethers.parseUnits("10000", 18))
        })
    })

})
