var HDWalletProvider = require("truffle-hdwallet-provider");

var wallet = require("testnet_ethereum_hdwallet").wallet;
var mnemonic = require("testnet_ethereum_hdwallet").mnemonic;

module.exports = {
  rpc: {
    host: "localhost",
    port: 8545
  },
  mocha: {
    useColors: true
  },
  networks: {
    "development": {
        host: "localhost",
        port: 8545,
        network_id: "default",
        gas: 2000000,
        gasPrice: 100000000000
    },
    "testnet": {
	    network_id: 3,
	    host: "localhost",
	    port: 8545
	  },
    "infura_testnet": {
      network_id: 3,
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/Lsma3OM3TIyDGHKoAmP8"),
      gas: 4700000,
      gasPrice: 100000000000
    }
  }

};
