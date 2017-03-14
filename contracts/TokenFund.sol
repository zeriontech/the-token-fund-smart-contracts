pragma solidity ^0.4.6;

import "./StandardToken.sol";

/// @title Token contract - Implements Standard Token Interface for TokenFund.
/// @author Evgeny Yurtaev - <evgeny@etherionlab.com>
contract TokenFund is StandardToken {

    /*
     * External contracts
     */
    address public emissionContractAddress = 0x0;

    /*
     * Token meta data
     */
    string constant public name = "TheToken Fund";
    string constant public symbol = "TKN";
    uint8 constant public decimals = 8;

    /*
     * Storage
     */
    address public owner = 0x0;
    bool emissionEnabled = true;
    bool transfersEnabled = true;

    /*
     * Modifiers
     */

    modifier isCrowdfundingContract() {
        // Only emission address is allowed to proceed.
        if (msg.sender != emissionContractAddress) {
            throw;
        }
        _;
    }

    modifier onlyOwner() {
        // Only owner is allowed to do this action.
        if (msg.sender != owner) {
            throw;
        }
        _;
    }

    /*
     * Contract functions
     */

     /// @dev TokenFund emission function.
    /// @param _for Address of receiver.
    /// @param tokenCount Number of tokens to issue.
    function issueTokens(address _for, uint tokenCount)
        external
        isCrowdfundingContract
        returns (bool)
    {
        if (emissionEnabled == false) {
            throw;
        }

        balances[_for] += tokenCount;
        totalSupply += tokenCount;
        return true;
    }

    /// @dev Withdraws tokens for msg.sender.
    /// @param tokenCount Number of tokens to withdraw.
    function withdrawTokens(uint tokenCount)
        public
        returns (bool)
    {
        uint balance = balances[msg.sender];
        if (balance < tokenCount) {
            return false;
        }
        balances[msg.sender] -= tokenCount;
        totalSupply -= tokenCount;
        return true;
    }

    /// @dev Function to change address that is allowed to do emission.
    /// @param newAddress Address of new emission contract.
    function changeEmissionContractAddress(address newAddress)
        external
        onlyOwner
        returns (bool)
    {
        emissionContractAddress = newAddress;
    }

    /// @dev Function that enables/disables transfers of token.
    /// @param value True/False
    function enableTransfers(bool value)
        external
        onlyOwner
    {
        transfersEnabled = value;
    }

    /// @dev Function that enables/disables token emission.
    /// @param value True/False
    function enableEmission(bool value)
        external
        onlyOwner
    {
        emissionEnabled = value;
    }

    /*
     * Overriding ERC20 standard token functions to support transfer lock
     */
    function transfer(address _to, uint256 _value)
        returns (bool success)
    {
        if (transfersEnabled == true) {
            return super.transfer(_to, _value);
        }
        return false;
    }

    function transferFrom(address _from, address _to, uint256 _value)
        returns (bool success)
    {
        if (transfersEnabled == true) {
            return super.transferFrom(_from, _to, _value);
        }
        return false;
    }


    /// @dev Contract constructor function sets initial token balances.
    /// @param _owner Address of the owner of TokenFund.
    function TokenFund(address _owner)
    {
        totalSupply = 0;
        owner = _owner;
    }
}
