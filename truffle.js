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
        network_id: "default"
    },
    "testnet": {
	    network_id: 2,  // Official Ethereum test network
	    host: "localhost",
	    port: 8545
	}
  }

};
