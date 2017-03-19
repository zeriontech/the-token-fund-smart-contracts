var TokenFund = artifacts.require("./TokenFund.sol");
var Fund = artifacts.require("./Fund.sol");

module.exports = function(deployer, network) {
	var acc = web3.eth.accounts[0];
	if (network == "testnet") {
	  	var founder = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	// var founder = "0xd7461F8E7c47F7bA122E68669B563eC0F8328910"; // local second account
	  	var multisig = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	} else if (network == 'development') {
		var founder = acc;
		var multisig = acc;
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	}

	var tokenContract;

	deployer.deploy(TokenFund, acc).then(function() {
  		return deployer.deploy(Fund, founder, multisig, support, TokenFund.address);
  	}).then(function() {
  		return TokenFund.deployed();
  	}).then(function(instance) {
  		tokenContract = instance;
  		return tokenContract.changeEmissionContractAddress(Fund.address);
  	}).then(function() {
  		return tokenContract.transferOwnership(founder);
  	});
};
