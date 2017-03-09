var TokenFund = artifacts.require("./TokenFund.sol");

module.exports = function(deployer, network) {
	if (network == "testnet") {
	  	var founder = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	var multisig = "0x74c128191f01dce550d81b19785b54b191259d2d";
	  	var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	  	deployer.deploy(TokenFund, founder, multisig, support);
	} else if (network == 'development') {
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
		deployer.deploy(TokenFund, web3.eth.accounts[0], web3.eth.accounts[0], support);
	}
};
