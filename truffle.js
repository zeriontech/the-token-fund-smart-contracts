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
        port: 8546,
        network_id: "default"
    },
    "testnet": {
	    network_id: 3,
	    host: "localhost",
	    port: 8545
	  }
  }
};
