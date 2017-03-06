var gasAmount = 2000000;

var TokenFund = artifacts.require("./TokenFund.sol");


// Test investments
contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should invest ETH directly and issue tokens", function(done) {
        // TokenFund Contract
        var contract;

        // save initial balance of the ethInvestor
        var initialBalance = web3.fromWei(web3.eth.getBalance(ethInvestor), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        var tokenPrice = 0;

        TokenFund.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(ethInvestor);
        }).then(function(balance) {
            // make sure that he doesn't have any tokens so far
            assert.equal(balance.toNumber(), 0, "Not null balance");
            // invest 10 ETH using function fund()
            return contract.fund({
                from: ethInvestor,
                gas: gasAmount,
                value: web3.toWei(10, "Ether")
            });
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

    it("Should issue tokens via fundBTC()", function(done) {
        // TokenFund Contract
        var contract;

        var tokenCount = 10000;

        TokenFund.deployed().then(function(instance) {
            contract = instance;
            return contract.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            // make sure that he doesn't have any tokens so far
            assert.equal(balance.toNumber(), 0, "Not null balance");
            // invest 10000 Tokens using function fundBTC()
            return contract.fundBTC(
                btcInvestor, // beneficiary
                tokenCount // Number of tokens to issue
            )
        }).then(function(tx_id) {
            return contract.balanceOf.call(btcInvestor);
        }).then(function(investorTokenCount) {
            // check that investor received correct number of tokens
            assert.equal(investorTokenCount.toNumber(),
                tokenCount,
                "Wrong number of tokens was given");
        }).then(done);
    });
});


// test transfers
contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should check simple transfer and transfer lock", function(done) {
        // TokenFund Contract
        var contract;

        var tokenCount = 10000;
        var tokensToTransfer = 1234;

        TokenFund.deployed().then(function(instance) {
            contract = instance;
            return contract.fundBTC(
                        btcInvestor, // beneficiary
                        tokenCount // Number of tokens to issue
                    );
        }).then(function(tx_id) {
            return contract.balanceOf(btcInvestor);
        }).then(function(balance) {
            assert.equal(balance, tokenCount, "Wrong number of tokens was given");
            return contract.transfer(
                ethInvestor, // to
                tokensToTransfer, // count
                {from: btcInvestor} // Set btc investor as a sender
            );
        }).then(function(tx_id) {
            return contract.balanceOf.call(btcInvestor);
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokenCount - tokensToTransfer,
                    "New number of tokens for the first investor is incorrect");
                return contract.balanceOf.call(ethInvestor);
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokensToTransfer,
                    "New number of tokens for the second investor is incorrect");
                return contract.enableTransfers(false, {from: owner});
        }).then(function(val) {
            // Check new investor balances
            return contract.transfer(
                btcInvestor, // to
                tokensToTransfer, // count
                {from: ethInvestor} // Set btc investor as a sender
            );
        }).then(function(tx_id) {
            return contract.balanceOf.call(btcInvestor)
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokenCount - tokensToTransfer,
                    "Balance should not have changed for the first investor");
                return contract.balanceOf.call(ethInvestor);
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokensToTransfer,
                    "Balance should not have changed for the second investor");
        }).then(done);
    });
});


// test emission lock
contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should check emission lock", function(done) {
        // TokenFund Contract
        var contract;

        var tokenCount = 10000;

        TokenFund.deployed().then(function(instance) {
            contract = instance;
            return contract.enableEmission(
                        false,
                        {from: owner}
                    );
        }).then(function(tx_id) {
            // Check new investor balances
            return contract.fundBTC(
                btcInvestor, // beneficiary
                tokenCount // Number of tokens to issue
            ).catch(function(err) {
              // This is expected behavior.
            });
        }).then(function(tx_id) {
            contract.balanceOf.call(btcInvestor).then(function(balance) {
                assert.equal(balance.toNumber(),
                    0,
                    "Investor should not have received any tokens.");
            });
        }).then(done);
    });
});
