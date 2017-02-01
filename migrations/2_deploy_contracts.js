module.exports = function(deployer) {
  deployer.autolink();

  deployer.deploy(CustomToken, "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a").then(function() {
	return deployer.deploy(CustomICO, "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a", CustomToken.address);
  });
};
