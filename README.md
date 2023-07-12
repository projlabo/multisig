# multisig

This is the step by step process that needs to be followed in order for the two contracts to work properly together:

1) Deploy the pepetest.sol file on Ethereum
  A) The Constructor requires that you include the Uniswap V2 Rounter address

2) Verify and Publish the pepetest.sol code on etherscan.io

3) Deploy the multisig.sol file on Ethereum
   * Include an array of addresses (with no spaces) that'll be the "owners" of the contract. These owners will having proposal, voting, and execution powers
     * eg: ["0x00000000000000000000000000000000","0x00000000000000000000000000000000","0x00000000000000000000000000000000"]
   * Include the value for how many votes are required for a proposal to move forward
   * Add the address of the pepetest.sol address that the multisig has control over 

4) Verify and Publish the multisig.sol code on etherscan.io

5) Modify the taxwallet address in the pepetest.sol contract with the multisig's address (the multisig will then become the wallet taxes go to)

6) Use the `excludeFromFee()` function in pepetest.sol to excluse the multisig's address from Fees.

7) Transfer ownership in the pepetest.sol contract over to the multisig address

8) Funds will need to be sent to the Multisig in order
   * This can be done either by sending to the contract directly (receive() external payable{} was included in the code for this purpose), or by using the `depositeLiquidity()` function. 

9) Send the funds to the pepetest.sol contract by using the section1DistroProposal function

10) Propose, Vote, and Execute the injectLiquidity function

11) Lock the liquidity, either permanently or for a period of 3 weeks

12) If the project is successful, lock the liquidity permanently. If the project isn't, make sure to give back the liquidity providers their initial funds, as promised, by sing the  returnLiquidity function
		
