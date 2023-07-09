

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
        
        it("Should revert on section 2 proposal if length of array of addresses doesn't match length of array of distributions", async function () {
            const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);
            var arrayofAddresses = ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"];
            var arrayofDistributions = ["1", "2"];
            var perc = 10;
            await expect(multiSigWallet.section2DistroProposal(arrayofAddresses, arrayofDistributions, perc)).to.be.revertedWith(
                "Not the same length"
            );
        });


        it("Should revert on section 2 execution if length of array of addresses doesn't match length of array of distributions", async function () {
            const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);
            var arrayofAddresses = ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"];
            var arrayofDistributions = ["1", "2"];
            var perc = 10;
            var txIndex = 1;
            await expect(multiSigWallet.section2DistroExecution(arrayofAddresses, arrayofDistributions, perc, txIndex)).to.be.revertedWith(
                "Not the same length"
            );
        });

        it("section 2 proposal valid call", async function () {
            const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);
            var arrayofAddresses = ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"];

            var arrayofDistributions = ["1"];
            var perc = 10;
            await multiSigWallet.section2DistroProposal(arrayofAddresses, arrayofDistributions, perc);

            expect( await multiSigWallet.txInternalOrNot(0)).to.equal(true);
            expect( await multiSigWallet.hashList(0)).to.equal("0x6a1a82533cb2aa53d629c31e120062b2990159940e46d7e3baa7d3093833310f");
            expect( await multiSigWallet.getTransactionCount()).to.equal(1);


        });


        it ("should do 4 full tasks (each including proposal, approvals, revokes, and execution)", async function() {
            const {pepeTest, multiSigWallet, owner1, owner2, owner3, owner4, owner5, member01, member02, member03, member04} = await loadFixture(deployAgain02);
            
//=========================
// threeWeekLockProposal(uint _txIndex)
//=========================
            await expect(multiSigWallet.transactions(0)).to.be.reverted; // no transactions here yet so should revert
            await expect(multiSigWallet.connect(member01).threeWeekLockProposal()).to.be.reverted;//member01 is not an owner, so should revert
            await expect(multiSigWallet.connect(owner1).threeWeekLockProposal()).to.not.be.reverted; // proposing to lock the contract for 3 weeks, should go through since it's an owner suggesting it
            let proposal_0 = await multiSigWallet.transactions(0);//the proposal should now exist
            console.log(`proposal_0: ${proposal_0}`);
                //=========================
                // approveProposal(uint _txIndex) and revokeApproval(uint _txIndex)
                //=========================
            expect(proposal_0[4]).to.equal(0);//since no one voted to approve the proposal yet
            await expect(multiSigWallet.connect(member02).approveProposal(0)).to.be.reverted; //member02 is not an owner, shouldn't be able to approve anything
            await expect(multiSigWallet.connect(owner2).approveProposal(0)).to.not.be.reverted; //member02 is not an owner, shouldn't be able to approve anything
            proposal_0 = await multiSigWallet.transactions(0);
            expect(proposal_0[4]).to.be.equal(1);// since 1 approval already took place
            await expect(multiSigWallet.connect(owner2).revokeApproval(0)).to.not.be.reverted;
            proposal_0 = await multiSigWallet.transactions(0)
            expect(proposal_0[4]).to.be.equal(0);// since 0 you just revoked it
            await expect (multiSigWallet.connect(owner1).approveProposal(0)).to.not.be.reverted;
            await expect (multiSigWallet.connect(owner2).approveProposal(0)).to.not.be.reverted;
            proposal_0 = await multiSigWallet.transactions(0)
            expect(proposal_0[4]).to.be.equal(2);// since you just approved it by 2 people
                //=========================
                // executeExternalProposal(uint _txIndex)
                //=========================
            expect(await multiSigWallet.txInternalOrNot(0)).to.be.equal(false);
            await expect (multiSigWallet.connect(owner1).executeExternalProposal(0)).to.be.revertedWith("cannot execute tx");//didn't execute because it needs at least 3 votes
            await expect( multiSigWallet.connect(owner3).approveProposal(0)).to.not.be.reverted;
            proposal_0 = await multiSigWallet.transactions(0)
            expect(proposal_0[4]).to.be.equal(3);
            let lockTimestampVar = await pepeTest.lockTimestamp();
            // console.log(`lockTimestampVar: ${lockTimestampVar}, typeof: ${typeof(lockTimestampVar)}`);
            await expect (multiSigWallet.connect(owner1).executeExternalProposal(0)).to.not.be.reverted;//so the other contract should be locked
                //=========================
                // confirming it executed properly in pepeTest
                //=========================
            lockTimestampVar = await pepeTest.lockTimestamp();
            // console.log(`lockTimestampVar: ${lockTimestampVar}, typeof: ${typeof(lockTimestampVar)}`);
            let blockNumber = await ethers.provider.getBlockNumber();
            // console.log(`blockNumber: ${blockNumber}`);
            let blockObject = await ethers.provider.getBlock(blockNumber);
            let blockTimestamp =  await blockObject.timestamp;
            // console.log(`blockTimestamp: ${blockTimestamp}`);
            let approxTimestampLock = blockTimestamp + (21 * 24 * 60 * 60); //adding three weeks
            // console.log(`approxTimestampLock: ${approxTimestampLock}`);
            expect(Number(approxTimestampLock)).to.be.greaterThanOrEqual(lockTimestampVar);
            expect(Number(lockTimestampVar) + 100).to.be.greaterThanOrEqual(approxTimestampLock);

//=========================
// permanentLiquidityLockProposal()
//=========================
            await expect(multiSigWallet.transactions(1)).to.be.reverted; // no transactions here yet so should revert
            await expect(multiSigWallet.connect(member01).permanentLiquidityLockProposal()).to.be.reverted;//member01 is not an owner, so should revert
            await expect(multiSigWallet.connect(owner4).permanentLiquidityLockProposal()).to.not.be.reverted; //should go through since it's an owner suggesting it
            let proposal_1 = await multiSigWallet.transactions(1);//the proposal should now exist
            console.log(`proposal_1: ${proposal_1}`);
                //=========================
                // approveProposal(uint _txIndex) and revokeApproval(uint _txIndex)
                //=========================
            expect(proposal_1[4]).to.equal(0);//since no one voted to approve the proposal yet
            await expect(multiSigWallet.connect(member04).approveProposal(1)).to.be.reverted; //member02 is not an owner, shouldn't be able to approve anything
            await expect(multiSigWallet.connect(owner5).approveProposal(1)).to.not.be.reverted; //member02 is not an owner, shouldn't be able to approve anything
            proposal_1 = await multiSigWallet.transactions(1);
            expect(proposal_1[4]).to.be.equal(1);// since 1 approval already took place
            await expect(multiSigWallet.connect(owner1).revokeApproval(1)).to.be.reverted;// SINCE he never approved in the first place
            await expect(multiSigWallet.connect(owner5).revokeApproval(1)).to.not.be.reverted;
            proposal_1 = await multiSigWallet.transactions(1)
            expect(proposal_1[4]).to.be.equal(0);// since 0 you just revoked it
            await expect (multiSigWallet.connect(owner4).approveProposal(1)).to.not.be.reverted;
            await expect (multiSigWallet.connect(owner5).approveProposal(1)).to.not.be.reverted;
            proposal_1 = await multiSigWallet.transactions(1)
            expect(proposal_1[4]).to.be.equal(2);// since you just approved it by 2 people
                //=========================
                // executeExternalProposal(uint _txIndex)
                //=========================
            expect(await multiSigWallet.txInternalOrNot(1)).to.be.equal(false);
            await expect (multiSigWallet.connect(member01).executeExternalProposal(1)).to.be.revertedWith("not owner");
            await expect (multiSigWallet.connect(owner5).executeExternalProposal(1)).to.be.revertedWith("cannot execute tx");//didn't execute because it needs at least 3 votes
            await expect( multiSigWallet.connect(owner1).approveProposal(1)).to.not.be.reverted;
            await expect( multiSigWallet.connect(owner2).approveProposal(1)).to.not.be.reverted;
            proposal_1 = await multiSigWallet.transactions(1)
            expect(proposal_1[4]).to.be.equal(4);
            let lockedVariableBefore = await pepeTest.locked();
            console.log(`lockedVariableBefore: ${lockedVariableBefore}, typeof: ${typeof(lockedVariableBefore)}`);
            await expect (multiSigWallet.connect(owner5).executeExternalProposal(1)).to.not.be.reverted;//so the other contract should be locked
                //=========================
                // confirming it executed properly in pepeTest
                //=========================
            let lockedVariableAfter = await pepeTest.locked();
            console.log(`lockedVariableAfter: ${lockedVariableAfter}, typeof: ${typeof(lockedVariableAfter)}`);
            expect(lockedVariableBefore).to.be.equal(false);
            expect(lockedVariableAfter).to.be.equal(true);

            //     //voting on returning liquidity, just to see the failure
            // await multiSigWallet.connect(owner1).returnLiquidityProposal();
            // await multiSigWallet.connect(owner1).approveProposal(2);
            // await multiSigWallet.connect(owner2).approveProposal(2);
            // await multiSigWallet.connect(owner3).approveProposal(2);
            // await expect( multiSigWallet.connect(owner1).executeExternalProposal(2)).to.be.revertedWith("Liquidity locked");

    //=========================
    // section1DistroProposal (address _llDistributionContract, uint _percentage)
    //=========================
                //=========================
                //Adding funds to be distributed
                //=========================
            let oneEth = ethers.parseEther("1"); //getting the bignumber version of 1 Eth
            let halfEth = ethers.parseEther("0.5"); //getting the bignumber version of 1 Eth
            await owner1.sendTransaction({to: multiSigWallet.target, value: oneEth});
            let multisigBalance = await ethers.provider.getBalance(multiSigWallet.target);
            console.log(`multisigBalance: ${multisigBalance}`);

            await expect(multiSigWallet.connect(member01).section1DistroProposal(owner3.address, 50)).to.be.revertedWith("not owner");
            await multiSigWallet.connect(owner1).section1DistroProposal(owner3.address, 50);
            let proposal_2 = await multiSigWallet.transactions(2);
            expect(proposal_2[4]).to.equal(0); // console.log(`proposal_2[4]: ${proposal_2[4]}`);
                //=========================
                // approveProposal(uint _txIndex) and revokeApproval(uint _txIndex)
                //=========================
            await expect(multiSigWallet.connect(owner5).approveProposal(2)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner4).approveProposal(2)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner1).section1DistroExecution(owner3.address, 50, 2)).to.be.revertedWith("Not enough confirmations");
            await expect(multiSigWallet.connect(owner3).approveProposal(2)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner2).approveProposal(2)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner1).approveProposal(2)).to.not.be.reverted;
            proposal_2 = await multiSigWallet.transactions(2);
            expect(proposal_2[4]).to.equal(5); // console.log(`proposal_2[4]: ${proposal_2[4]}`);
            await expect(multiSigWallet.connect(owner1).revokeApproval(2)).to.not.be.reverted;// SINCE he never approved in the first place
            proposal_2 = await multiSigWallet.transactions(2);
            expect(proposal_2[4]).to.equal(4);
            console.log(`proposal_2[4]: ${proposal_2[4]}`);
                //=========================
                // executeExternalProposal(uint _txIndex)
                //=========================
                // output the hash?
            let hashVar = await multiSigWallet.hashList(2);// array or variable in parenthesis?
            console.log(`hashVar: ${hashVar}`);
                // trying to execute it with a different set of variables
            await expect(multiSigWallet.connect(owner1).section1DistroExecution(owner4.address, 50, 2)).to.be.revertedWith("Not the same hash");
                //using this later for the confirming phase
                let owner3BalanceBefore = await ethers.provider.getBalance(owner3.address); //getting it for a later comparison
                console.log(`owner3BalanceBefore: ${owner3BalanceBefore}`);
            await expect(multiSigWallet.connect(owner1).section1DistroExecution(owner3.address, 50, 2)).to.not.be.reverted;
                //=========================
                // confirming it executed properly
                //=========================
            let owner3BalanceAfter = await ethers.provider.getBalance(owner3.address);
            console.log(`owner3BalanceAfter: ${owner3BalanceAfter}`);
            expect(owner3BalanceAfter).to.equal(owner3BalanceBefore + halfEth);
            let contractBal = await ethers.provider.getBalance(multiSigWallet.target);
            expect(contractBal).to.equal(halfEth); //0.5 Eth are still in the contract to be distributed, nice. Thats to be expected since you chose 50 percent in the variables
            
    //=========================
    // section2DistroProposal(address[] memory _arrayOfAddresses, uint[] memory _distribution, uint _percentage)
    //=========================
                
            let _arrayOfAddresses = [owner1.address, owner2.address, owner3.address, owner4.address, owner5.address, member01.address, member02.address];
            await expect(multiSigWallet.connect(member02).section2DistroProposal(_arrayOfAddresses, [1,2,1,2,1,3,1],100)).to.be.revertedWith("not owner");
            await expect(multiSigWallet.connect(owner4).section2DistroProposal(_arrayOfAddresses, [1,2,1,2,1,3,1],100)).to.not.be.reverted;
            let proposal_3 = await multiSigWallet.transactions(3);
            expect(proposal_3[4]).to.equal(0);//no approvals yet
            await expect(multiSigWallet.transactions(4)).to.be.reverted;
                //=========================
                // approveProposal(uint _txIndex) and revokeApproval(uint _txIndex)
                //=========================
            await expect(multiSigWallet.connect(member02).approveProposal(3)).to.be.revertedWith("not owner");
            await expect(multiSigWallet.connect(member02).revokeApproval(3)).to.be.revertedWith("not owner");
            await expect(multiSigWallet.connect(owner5).approveProposal(3)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner4).approveProposal(3)).to.not.be.reverted;
            proposal_3 = await multiSigWallet.transactions(3);
            expect(proposal_3[4]).to.equal(2);
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddresses, [1,2,1,2,1,3,1],100,3)).to.be.revertedWith("Not enough confirmations");
            await expect(multiSigWallet.connect(owner3).approveProposal(3)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner2).approveProposal(3)).to.not.be.reverted;
            await expect(multiSigWallet.connect(owner1).approveProposal(3)).to.not.be.reverted;
            proposal_3 = await multiSigWallet.transactions(3);
            expect(proposal_3[4]).to.equal(5);
                //=========================
                // executeExternalProposal(uint _txIndex)
                //=========================
            let _arrayOfAddressesFake = [owner1.address, owner2.address, owner3.address, owner4.address, owner5.address, member01.address, member03.address];
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddressesFake, [1,2,1,2,1,3,1],100,3)).to.be.revertedWith("Not the same hash");
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddresses, [3,2,1,2,1,3,1],100,3)).to.be.revertedWith("Not the same hash");
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddresses, [1,2,1,2,1,3,1],101,3)).to.be.revertedWith("Not the same hash");
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddresses, [1,2,1,2,1,3,1],100,4)).to.be.revertedWith("Not the same hash");
                //getting all the balances before the distribution is done, so I can confirm after the distribution that each one has been given what they were meant to be given
                let balanceArrayBefore = [];
                let balanceArrayAfter = [];
                let tempbuffer;
                for (let i=0; i<_arrayOfAddresses.length; i++){
                    tempbuffer = await ethers.provider.getBalance(_arrayOfAddresses[i]);
                    balanceArrayBefore.push(Number(tempbuffer));
                }          
                // console.log(`balanceArrayBefore: ${JSON.stringify(balanceArrayBefore, null, 2)}`);  
            await expect(multiSigWallet.connect(owner1).section2DistroExecution(_arrayOfAddresses, [1,2,1,2,1,3,1],100,3)).to.not.be.reverted;
                //=========================
                // confirming it executed properly
                //=========================
            let distributionArray = [1,2,1,2,1,3,1];
            let denominator = 0;
            distributionArray.forEach((x)=>{denominator+=x});
            console.log(`denominator: ${denominator}`)
            let addedFundsArray = [];
            for (let i=0; i<distributionArray.length; i++) {
                tempbuffer = (Number(contractBal) * distributionArray[i])/denominator;
                addedFundsArray.push(tempbuffer);
            }
            console.log(JSON.stringify(addedFundsArray, null, 2));
            console.log(`balanceArrayBefore.length:${balanceArrayBefore.length}`)
            for (let i=0; i<balanceArrayBefore.length; i++) {
                tempbuffer = balanceArrayBefore[i]+addedFundsArray[i];
                balanceArrayAfter.push(tempbuffer);
            };
            console.log(`balanceArrayAfter.length:${balanceArrayAfter.length}`)
            for (let i=0; i<balanceArrayAfter.length; i++) {
                tempbuffer = await ethers.provider.getBalance(_arrayOfAddresses[i]);
                tempbuffer = Number(tempbuffer);
                console.log(tempbuffer);
                console.log(balanceArrayAfter[i]);
                console.log(`===================`);
                let a = Math.floor((tempbuffer/1000000000000000));
                let b = Math.floor((balanceArrayAfter[i]/1000000000000000));
                console.log(`a: ${a}, b: ${b}`);
                expect(a).to.equal(b);
            }
        });
        
        // it("Should ...", async function(){
        //     const {pepeTest, multiSigWallet, owner1} = await loadFixture(deployAgain02);

        // });
    });
  });
  
