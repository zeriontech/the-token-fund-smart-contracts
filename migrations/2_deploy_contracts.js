var TokenFund = artifacts.require("./TokenFund.sol");
var Fund = artifacts.require("./Fund.sol");

var wallet = require("../node_modules/testnet_ethereum_hdwallet").wallet;

module.exports = function(deployer, network) {
	if (network == "testnet") {
  	var founder = "0x74c128191f01dce550d81b19785b54b191259d2d";
  	var multisig = "0x74c128191f01dce550d81b19785b54b191259d2d";
  	var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
		var coinbase = web3.eth.accounts[0];
	} else if (network == 'development') {
		var founder = web3.eth.accounts[0];
		var multisig = web3.eth.accounts[0];
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
		var coinbase = web3.eth.accounts[0];
	} else if (network == 'infura_testnet') {
		var founder = wallet.getAddressString();
		var multisig = wallet.getAddressString();
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
		var coinbase = wallet.getAddressString();
	}

	deployer.deploy(TokenFund, founder).then(function() {
		return deployer.deploy(Fund, founder, multisig, support, TokenFund.address);
	}).then(function() {
		return TokenFund.deployed();
	}).then(function(tokenContract) {
		if (founder != coinbase) {
			// emission contract address must be set manualy
			console.log("You need to change emission address manually.");
			return;
		}
		return tokenContract.changeEmissionContractAddress(Fund.address,
			function (error, result) {
        if (!error) {
          console.log("Transaction successful " + result);
        } else {
          console.log("Error" + error);
        }
    	}
		);
	});
};
