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
	  },
    live: {
      host: "localhost", // Random IP for example purposes (do not use)
      port: 8545,
      network_id: 1,        // Ethereum public network
      // gas
      gasPrice: 20000000000,
      from: "0x212de331b2a8c21fcf091c8f3cd13e613bb0af95"
    }
  }
};
