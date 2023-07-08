

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("Lock", function () {
    async function deployAgain() { // without ownership transfered yet
      const THREE_WEEKS_IN_SECONDS = 21 * 24 * 60 * 60;
      const unlockTime = (await time.latest()) + THREE_WEEKS_IN_SECONDS;
  
      const [owner1, owner2, owner3, owner4, owner5, member01, member02, member03] = await ethers.getSigners();
      const ownerArray = [owner1.address,owner2.address,owner3.address,owner4.address,owner5.address];
      const uniswapMainnetAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  
      const PepeTest = await ethers.getContractFactory("PepeTestPublic");
    //   const PepeTest = await ethers.getContractFactory("PepeTest");
      const pepeTest = await PepeTest.deploy(uniswapMainnetAddress, { value: 0 });

      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
      const multiSigWallet = await MultiSigWallet.deploy(ownerArray, 3, pepeTest.target);

       return { pepeTest, multiSigWallet, ownerArray, owner1, owner2 };
    }
    
    async function deployAgain02() { // with ownership transfered
        const THREE_WEEKS_IN_SECONDS = 21 * 24 * 60 * 60;
        const unlockTime = (await time.latest()) + THREE_WEEKS_IN_SECONDS;
    
        const [owner1, owner2, owner3, owner4, owner5, member01, member02, member03] = await ethers.getSigners();
        const ownerArray = [owner1.address,owner2.address,owner3.address,owner4.address,owner5.address];
        // const signerArray = [owner1, owner2, owner3, owner4, owner5, member01, member02, member03];
        const uniswapMainnetAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    
        const PepeTest = await ethers.getContractFactory("PepeTestPublic");
        // const PepeTest = await ethers.getContractFactory("PepeTest");
        const pepeTest = await PepeTest.deploy(uniswapMainnetAddress, { value: 0 });
  
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSigWallet = await MultiSigWallet.deploy(ownerArray, 3, pepeTest.target);

        await pepeTest.set_taxWallet(multiSigWallet.target);
        await pepeTest.excludeFromFee(multiSigWallet.target);
        await pepeTest.transferOwnership(multiSigWallet.target);
  
         return { pepeTest, multiSigWallet, ownerArray, owner1, owner2, owner3, owner4, owner5, member01, member02, member03 };
      }

    describe("Deployment", function() {
        it("Should have the owner still be the first owner address ", async function() {
            const {pepeTest, multiSigWallet, ownerArray, owner1, owner2} = await loadFixture(deployAgain);
            expect(await pepeTest.owner()).to.be.equal(ownerArray[0]);
            expect(await pepeTest.owner()).to.not.equal(ownerArray[1]);

            // console.log(`001`);
            let ownershipVar = await pepeTest.owner();
            console.log(`oownershipVar: ${ownershipVar}`);
            await pepeTest.transferOwnership(multiSigWallet.target);
            ownershipVar = await pepeTest.owner();
            console.log(`oownershipVar: ${ownershipVar}`);
        })
    });

    describe("Post Settup", function() {
        it("Should have the multisig wallet as the owner", async function() {
            const {pepeTest, multiSigWallet} = await loadFixture(deployAgain02);
            expect (await pepeTest.owner()).to.be.equal(multiSigWallet.target);
        })

        it("(the multisig) Should be able to receive funds via direct transfers", async function(){
            const {multiSigWallet, owner1} = await loadFixture(deployAgain02);

            let zeroEth = ethers.parseEther("0");
            let oneEth = ethers.parseEther("1");

            // console.log("Balance: ",await ethers.provider.getBalance(multiSigWallet));
            expect( await ethers.provider.getBalance(multiSigWallet)).to.equal(zeroEth);
            await owner1.sendTransaction({to: multiSigWallet.target, value: oneEth});
            // console.log("Balance: ",await ethers.provider.getBalance(multiSigWallet));
            expect( await ethers.provider.getBalance(multiSigWallet)).to.equal(oneEth);
        })

        it("(the multisig) Should be able to receive funds via depositLiquidity", async function(){
            const {multiSigWallet, owner1} = await loadFixture(deployAgain02);

            let zeroEth = ethers.parseEther("0");
            let oneEth = ethers.parseEther("1");

            expect( await ethers.provider.getBalance(multiSigWallet)).to.equal(zeroEth);
            // console.log("zero..");
            // console.log("Balance: ",await ethers.provider.getBalance(multiSigWallet));
            await multiSigWallet.depositLiquidity({value: oneEth});
            // console.log("Balance: ",await ethers.provider.getBalance(multiSigWallet));
            expect( await ethers.provider.getBalance(multiSigWallet)).to.equal(oneEth);
        });

        it("Should now be possible to view the public variables that were private earlier", async function(){
            const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);

            // getting all the now public variables, and testing them
            // to be what you expect them to
            let _maxTxAmount = await pepeTest._maxTxAmount();
            let _maxWalletSize = await pepeTest._maxWalletSize();
            let _taxSwapThreshold = await pepeTest._taxSwapThreshold();
            let _maxTaxSwap = await pepeTest._maxTaxSwap();

            let uniswapAddress = await pepeTest.uniswapAddress();

            let uniswapV2Router = await pepeTest.uniswapV2Router();
            let uniswapV2Pair = await pepeTest.uniswapV2Pair();
            let tradingOpen = await pepeTest.tradingOpen();
            let inSwap = await pepeTest.inSwap();
            let swapEnabled = await pepeTest.swapEnabled();

            //if this doesn't fail, then they are all public now, so it works, nice

            // console.log(`
            // _maxTxAmount: ${_maxTxAmount}
            // _maxWalletSize: ${_maxWalletSize}
            // _taxSwapThreshold: ${_taxSwapThreshold}
            // _maxTaxSwap: ${_maxTaxSwap}
            
            // uniswapAddress: ${uniswapAddress}

            // uniswapV2Router: ${uniswapV2Router}
            // uniswapV2Pair: ${uniswapV2Pair}
            // tradingOpen: ${tradingOpen}
            // inSwap: ${inSwap}
            // swapEnabled: ${swapEnabled}
            // `);
            
        });

        it("Should be able to make a proposal for injecting liquidity", async function(){
            const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);


        });

        // it("Should ...", async function(){
        //     const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);

        // });
    });
  });
  
