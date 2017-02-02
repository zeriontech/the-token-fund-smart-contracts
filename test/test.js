var gasAmount = 4000000;

contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular HumaniQ investor
    var investor = accounts[1];

    it("Should invest 10 ETH", function(done) {
        // TokenFund Contract
        var contract = TokenFund.deployed();

        // save initial balance of the investor
        var initialBalance = web3.fromWei(web3.eth.getBalance(investor), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        // make sure that he doesn't have any tokens so far
        var tokens = contract.balanceOf.call(investor).then(function(balance) {
            assert.equal(balance.toNumber(), 0, "Not null balance");
        });

        var tokenPrice = 0;
        // invest 10 ETH using function fund()
        return contract.fund({
            from: investor,
            gas: gasAmount,
            value: web3.toWei(10, "Ether")
        }).then(function(tx_id) {
            return contract.balanceOf.call(investor);
        }).then(function(balance) {
            // check that investor spent 10 ethers
            var accountBalance = web3.fromWei(web3.eth.getBalance(investor), "Ether");

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
            return contract.balanceOf.call(investor);
        }).then(function(investorTokenCount) {
            // check that investor received correct number of tokens
            assert.closeTo(investorTokenCount.toNumber(),
                (web3.toWei(10, "Ether") / tokenPrice),
                0.0000001, // possible javascript computational error
                "Wrong number of tokens was given");
        }).then(done);
    });

    // it("Should invest 5 ETH via fundBTC()", function(done) {
    //     // TokenFund Contract
    //     var contract = TokenFund.deployed();
    //
    //     // TODO(evgeny): Write this test
    //     done();
    // });
});
