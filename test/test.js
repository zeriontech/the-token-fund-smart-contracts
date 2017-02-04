var gasAmount = 2000000;

contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should invest 10 ETH", function(done) {
        // TokenFund Contract
        var contract = TokenFund.deployed();

        // save initial balance of the ethInvestor
        var initialBalance = web3.fromWei(web3.eth.getBalance(ethInvestor), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        // make sure that he doesn't have any tokens so far
        var tokens = contract.balanceOf.call(ethInvestor).then(function(balance) {
            assert.equal(balance.toNumber(), 0, "Not null balance");
        });

        var tokenPrice = 0;
        // invest 10 ETH using function fund()
        return contract.fund({
            from: ethInvestor,
            gas: gasAmount,
            value: web3.toWei(10, "Ether")
        }).then(function(tx_id) {
            return contract.balanceOf.call(ethInvestor);
        }).then(function(balance) {
            // check that ethInvestor spent 10 ethers
            var accountBalance = web3.fromWei(web3.eth.getBalance(ethInvestor), "Ether");

            assert.closeTo(accountBalance.toNumber(),
                initialBalance - 10,
                0.1, // some ethers were spent on gas
                "Wrong number of ether was spent");
            return contract.tokenPrice.call();
        }).then(function(_tokenPrice) {
            tokenPrice = _tokenPrice.toNumber();
            return contract.totalSupply.call();
        }).then(function(totalSupply) {
            // check that totalSupply of tokens is correct
            assert.closeTo(totalSupply.toNumber(),
                web3.toWei(10, "Ether") / tokenPrice,
                0.0000001, // possible javascript computational error
                "Wrong total supply");
            return contract.balanceOf.call(ethInvestor);
        }).then(function(ethInvestorTokenCount) {
            // check that investor received correct number of tokens
            assert.closeTo(ethInvestorTokenCount.toNumber(),
                (web3.toWei(10, "Ether") / tokenPrice),
                0.0000001, // possible javascript computational error
                "Wrong number of tokens was given");
        }).then(done);
    });

    it("Should invest 5 ETH via fundBTC()", function(done) {
        // TokenFund Contract
        var contract = TokenFund.deployed();

        // make sure that he doesn't have any tokens so far
        var tokens = contract.balanceOf.call(btcInvestor).then(function(balance) {
            assert.equal(balance.toNumber(), 0, "Not null balance");
        });

        var tokenCount = 10000;
        // invest 10000 Tokens using function fundBTC()
        return contract.fundBTC(
            btcInvestor, // beneficiary
            tokenCount, // Number of tokens to issue
        ).then(function(tx_id) {
            return contract.balanceOf.call(btcInvestor);
        }).then(function(investorTokenCount) {
            // check that investor received correct number of tokens
            assert.equal(investorTokenCount.toNumber(),
                tokenCount,
                "Wrong number of tokens was given");
        }).then(done);
    });
});

contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should check emission lock", function(done) {
        // TokenFund Contract
        var contract = TokenFund.deployed();

        var tokenCount = 10000;
        var tokensToTransfer = 1234;
        return contract.fundBTC(
            btcInvestor, // beneficiary
            tokenCount, // Number of tokens to issue
        ).then(function(tx_id) {
            return contract.transfer(
                ethInvestor, // to
                tokensToTransfer, // count
                {from: btcInvestor} // Set btc investor as a sender
            );
        }).then(function(tx_id) {
            // Check new investor balances
            contract.balanceOf.call(btcInvestor).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokenCount - tokensToTransfer,
                    "New number of tokens for the first investor is incorrect");
            });
            contract.balanceOf.call(ethInvestor).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokensToTransfer,
                    "New number of tokens for the second investor is incorrect");
            });
        }).then(done);
    });
});
