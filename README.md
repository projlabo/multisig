# multisig

This is the step by step process that needs to be followed in order for the two contracts to work properly together:

1) Deploy the pepetest.sol file on Ethereum

  A) The Constructor requires that you include the Uniswap V2 Rounter address (_uniswapAddress):

    // Sepolia Uniswap: 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    // Ethereum Mainnet Uniswap: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

  B) Remember to modify the 3 values of the contract to fit the desired name of the token:
  
    134: contract `PepeTestPublic` is Context, IERC20, Ownable {
    153: string private constant _name = unicode"PepeTest";
    154: string private constant _symbol = unicode"PT";

3) Verify and Publish the pepetest.sol code on etherscan.io

4) Deploy the multisig.sol file on Ethereum
   * Include an array of addresses (with no spaces) that'll be the "owners" of the contract. These owners will having proposal, voting, and execution powers
     * eg:
```
["0x00000000000000000000000000000000","0x00000000000000000000000000000000","0x00000000000000000000000000000000"]
```
   * Include the value for how many votes are required for a proposal to move forward
   * Add the address of the pepetest.sol address that the multisig has control over 

5) Verify and Publish the multisig.sol code on etherscan.io

6) Modify the taxwallet address in the pepetest.sol contract with the multisig's address (the multisig will then become the wallet taxes go to) by using the `set_taxWallet(...)` function.

7) Use the `excludeFromFee(...)` function in pepetest.sol to excluse the multisig's address from Fees.

8) Transfer ownership in the pepetest.sol contract over to the multisig address by using the `transferOwnership()` function.

9) Funds will need to be sent to the Multisig in order
   * This can be done either by sending to the contract directly (receive() external payable{} was included in the code for this purpose), or by using the `depositeLiquidity()` function. 

10) Send the funds to the pepetest.sol contract by using the section1DistroProposal function

11) Propose, Vote, and Execute the injectLiquidity function

12) Lock the liquidity, either permanently or for a period of 3 weeks

13) If the project is successful, lock the liquidity permanently. If the project isn't, make sure to give back the liquidity providers their initial funds, as promised, by sing the  returnLiquidity function
		
