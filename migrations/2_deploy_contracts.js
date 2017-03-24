var TokenFund = artifacts.require("./TokenFund.sol");
var Fund = artifacts.require("./Fund.sol");

module.exports = function(deployer, network) {
	var acc = web3.eth.accounts[0];
	var ethAddress = web3.eth.accounts[0];

	if (network == "testnet") {
  	var founder = "0x05aec595f8cd12d794aeac63c0988d5d7e247442";
  	var multisig = "0x6E8Ec8a086B485940B435D18303b59b6C35048C1";
  	var support = "0xd7461f8e7c47f7ba122e68669b563ec0f8328910";
	} else if (network == 'development') {
		var founder = acc;
		var multisig = acc;
		var support = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
	} else if (network == 'live') {
    var acc = "0x212de331b2a8c21fcf091c8f3cd13e613bb0af95";
		var founder = "0x8cfaa95cad5dddeddcebb350c50757c8fa26711f";
		// TheToken Fund ethereum address
		ethAddress = "0xBA3b826539161A4c3BF681752021847c25A2B46a";
    // TheToken Fund multisig address
    var multisig = "0x6E8Ec8a086B485940B435D18303b59b6C35048C1";
    // EtherionLab multisig address.
    var support = "0x9e8fAb94CADA52a584Ec6F10042c3Bb165E79114";
  }

	var tokenContract;

	deployer.deploy(TokenFund, acc).then(function() {
  		return deployer.deploy(Fund, founder, ethAddress, multisig, support, TokenFund.address);
  	}).then(function() {
  		return TokenFund.deployed();
  	}).then(function(instance) {
  		tokenContract = instance;
  		return tokenContract.changeEmissionContractAddress(Fund.address);
  	}).then(function() {
  		return tokenContract.transferOwnership(founder);
  	});
};
