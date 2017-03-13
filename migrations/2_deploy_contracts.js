var TokenFund = artifacts.require("./TokenFund.sol");
var Fund = artifacts.require("./Fund.sol");

module.exports = function(deployer, network) {
	if (network == "testnet") {
	  	var founder = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	var multisig = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	} else if (network == 'development') {
		var founder = web3.eth.accounts[0];
		var multisig = web3.eth.accounts[0];
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	}

	deployer.deploy(TokenFund, founder).then(function() {
  		return deployer.deploy(Fund, founder, multisig, support, TokenFund.address);
  	}).then(function() {
  		return TokenFund.deployed();
  	}).then(function(instance) {
  		if (founder != web3.eth.accounts[0]) {
  			// emission contract address must be set manualy
  			return;
  		}
  		return instance.changeEmissionContractAddress(Fund.address);
  	});
};
