module.exports = function(deployer) {
  deployer.autolink();

  deployer.deploy(TokenFund, "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a");
};
