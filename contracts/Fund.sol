pragma solidity ^0.4.6;

import "./TokenFund.sol";
import "./owned.sol";

contract Fund is owned {

	/*
     * External contracts
     */
    TokenFund public tokenFund;

	/*
     * Storage
     */
    address public multisig;
    address public supportAddress;
    uint public tokenPrice = 1 finney; // 0.001 ETH

    mapping (address => address) public referrals;

    /*
     * Contract functions
     */

	/// @dev Withdraws tokens for msg.sender.
    /// @param tokenCount Number of tokens to withdraw.
    function withdrawTokens(uint tokenCount)
        public
        returns (bool)
    {
        return tokenFund.withdrawTokens(tokenCount);
    }

    function issueTokens(address _for, uint tokenCount)
    	private
    	returns (bool)
    {
    	if (tokenCount == 0) {
        return false;
      }
      tokenCount = tokenCount * 100000000; // 8 decimals

      var percent = tokenCount / 100;

      // 1% goes to the fund managers
      if (!tokenFund.issueTokens(multisig, percent)) {
        // Tokens could not be issued.
        throw;
      }

		  // 1% goes to the support team
      if (!tokenFund.issueTokens(supportAddress, percent)) {
        // Tokens could not be issued.
        throw;
      }

      if (referrals[_for] != 0) {
      	// 3% goes to the referral
      	if (!tokenFund.issueTokens(referrals[_for], 3 * percent)) {
          // Tokens could not be issued.
          throw;
        }
      } else {
      	// if there is no referral, 3% goes to the fund managers
      	if (!tokenFund.issueTokens(multisig, 3 * percent)) {
          // Tokens could not be issued.
          throw;
        }
      }

      if (!tokenFund.issueTokens(_for, tokenCount - 5 * percent)) {
        // Tokens could not be issued.
        throw;
	    }

	    return true;
    }

    /// @dev Issues tokens for users who made investment.
    /// @param beneficiary Address the tokens will be issued to.
    /// @param valueInWei investment in wei
    function addInvestment(address beneficiary, uint valueInWei)
        external
        onlyOwner
        returns (bool)
    {
        uint tokenCount = calculateTokens(valueInWei);
    	return issueTokens(beneficiary, tokenCount);
    }

    /// @dev Issues tokens for users who made direct ETH payment.
    function fund()
        public
        payable
        returns (bool)
    {
        // Token count is rounded down. Sent ETH should be multiples of baseTokenPrice.
        address beneficiary = msg.sender;
        uint tokenCount = calculateTokens(msg.value);
        uint roundedInvestment = tokenCount * tokenPrice;

        // Send change back to user.
        if (msg.value > roundedInvestment && !beneficiary.send(msg.value - roundedInvestment)) {
          throw;
        }
        // Send money to multisig
        if (!multisig.send(roundedInvestment)) {
          throw;
        }
        return issueTokens(beneficiary, tokenCount);
    }

    function calculateTokens(uint valueInWei)
        public
        constant
        returns (uint)
    {
        return valueInWei / tokenPrice;
    }

    function setReferral(address client, address referral)
        public
        onlyOwner
    {
        referrals[client] = referral;
    }

    function getReferral(address client)
        public
        constant
        returns (address)
    {
        return referrals[client];
    }

    /// @dev Sets token price (TKN/ETH) in Wei.
    /// @param valueInWei New value.
    function setTokenPrice(uint valueInWei)
        public
        onlyOwner
    {
        tokenPrice = valueInWei;
    }

    function getTokenPrice()
        public
        returns (uint)
    {
        return tokenPrice;
    }

    /// @dev Contract constructor function
    /// @param _multisig Address of the owner of TokenFund.
    /// @param _supportAddress Address of the developers team.
    /// @param _tokenAddress Address of the token contract.
    function Fund(address _owner, address _multisig, address _supportAddress, address _tokenAddress)
    {
        owner = _owner;
        multisig = _multisig;
        supportAddress = _supportAddress;
        tokenFund = TokenFund(_tokenAddress);
    }

    /// @dev Fallback function. Calls fund() function to create tokens.
    function () payable {
        fund();
    }
}
