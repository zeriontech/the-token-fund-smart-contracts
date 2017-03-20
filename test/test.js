var gasAmount = 2000000;

var TokenFund = artifacts.require("./TokenFund.sol");
var Fund = artifacts.require("./Fund.sol");


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
        var token;

        // save initial balance of the ethInvestor
        var initialBalance = web3.fromWei(web3.eth.getBalance(ethInvestor), "Ether");
        assert.isAtLeast(initialBalance.toNumber(), 10, "Not enough money");

        var tokenPrice = 0;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return token.balanceOf.call(ethInvestor);
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
            return token.balanceOf.call(ethInvestor);
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
            return token.totalSupply.call();
        }).then(function(totalSupply) {
            // check that totalSupply of tokens is correct
            assert.closeTo(totalSupply.toNumber() / 100000000,
                web3.toWei(10, "Ether") / tokenPrice,
                0.0000001, // possible javascript computational error
                "Wrong total supply");
            return token.balanceOf.call(ethInvestor);
        }).then(function(ethInvestorTokenCount) {
            // check that investor received correct number of tokens
            assert.closeTo(ethInvestorTokenCount.toNumber(),
                (web3.toWei(10, "Ether") / tokenPrice) * 0.95 * 100000000, // considering 5% fee
                0.0000001, // possible javascript computational error
                "Wrong number of tokens was given");
        }).then(done);
    });

    it("Should issue tokens via addInvestment()", function(done) {
        // TokenFund Contract
        var contract;
        var token;

        var tokenCount = 10000;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            // make sure that he doesn't have any tokens so far
            assert.equal(balance.toNumber(), 0, "Not null balance");
            // invest 10000 Tokens using function addInvestment()
            return contract.addInvestment(
                btcInvestor, // beneficiary
                tokenCount * web3.toWei(0.001, "Ether") // value in wei
            )
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor);
        }).then(function(investorTokenCount) {
            // check that investor received correct number of tokens
            assert.equal(investorTokenCount.toNumber(),
                tokenCount * 0.95 * 100000000,
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
        var token;

        var tokenCount = 10000;
        var realTokenCount = tokenCount * 0.95 * 100000000;
        var tokensToTransfer = 1234 * 100000000;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return contract.addInvestment(
                        btcInvestor, // beneficiary
                        tokenCount * web3.toWei(0.001, "Ether")
                    );
        }).then(function(tx_id) {
            return token.balanceOf(btcInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), realTokenCount, "Wrong number of tokens was given");
            return token.transfer(
                ethInvestor, // to
                tokensToTransfer, // count
                {from: btcInvestor} // Set btc investor as a sender
            );
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    realTokenCount - tokensToTransfer,
                    "New number of tokens for the first investor is incorrect");
                return token.balanceOf.call(ethInvestor);
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    tokensToTransfer,
                    "New number of tokens for the second investor is incorrect");
                return token.enableTransfers(false, {from: owner});
        }).then(function(val) {
            // Check new investor balances
            return token.transfer(
                btcInvestor, // to
                tokensToTransfer, // count
                {from: ethInvestor} // Set btc investor as a sender
            );
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor)
        }).then(function(balance) {
                assert.equal(balance.toNumber(),
                    realTokenCount - tokensToTransfer,
                    "Balance should not have changed for the first investor");
                return token.balanceOf.call(ethInvestor);
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
        var token;

        var tokenCount = 10000;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return token.enableEmission(
                        false,
                        {from: owner}
                    );
        }).then(function(tx_id) {
            // Check new investor balances
            return contract.addInvestment(
                btcInvestor, // beneficiary
                tokenCount * web3.toWei(0.001, "Ether")
            ).catch(function(err) {
              // This is expected behavior.
            });
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(),
                         0,
                         "Investor should not have received any tokens.");
        }).then(done);
    });
});

// test referral system
contract('TokenFund', function(accounts) {
    // Owner of the contract
    var owner = accounts[0];
    // Regular TokenFund ethInvestor
    var ethInvestor = accounts[1];
    var btcInvestor = accounts[2];

    it("Should check tokens emission with referral", function(done) {
        // TokenFund Contract
        var contract;
        var token;

        var tokenCount = 10000;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return contract.setReferral(btcInvestor, ethInvestor, {
                from: owner
            });
        }).then(function(tx_id) {
            return contract.addInvestment(
                        btcInvestor, // beneficiary
                        tokenCount * web3.toWei(0.001, "Ether")
                    );
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(),
                         tokenCount * 0.95 * 100000000,
                         "btcInvestor is supposed to receive 95% of issued tokens");
            return token.balanceOf.call(ethInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(),
                         tokenCount * 0.03 * 100000000,
                         "ethInvestor is supposed to receive 3% of issued tokens as referral");
            return token.balanceOf.call(owner);
        }).then(function(balance) {
             assert.equal(balance.toNumber(),
                          tokenCount * 0.01 * 100000000,
                          "owner is supposed to receive 1% of tokens");
        }).then(done);
    });

    it("Should check tokens emission without referral", function(done) {
        // TokenFund Contract
        var contract;
        var token;

        var tokenCount = 10000;
        var btcInvestorBalance;
        var ethInvestorBalance;
        var ownerBalance;

        TokenFund.deployed().then(function(instance) {
            token = instance;
            return Fund.deployed();
        }).then(function(instance) {
            contract = instance;
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            btcInvestorBalance = balance.toNumber();
            return token.balanceOf.call(ethInvestor);
        }).then(function(balance) {
            ethInvestorBalance = balance.toNumber();
            return token.balanceOf.call(owner);
        }).then(function(balance) {
            ownerBalance = balance.toNumber();
            return contract.addInvestment(
                        ethInvestor, // beneficiary
                        tokenCount * web3.toWei(0.001, "Ether")
                    );
        }).then(function(tx_id) {
            return token.balanceOf.call(btcInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(),
                         btcInvestorBalance,
                         "btcInvestor is not supposed to receive any tokens");
            return token.balanceOf.call(ethInvestor);
        }).then(function(balance) {
            assert.equal(balance.toNumber(),
                         ethInvestorBalance + tokenCount * 0.95 * 100000000,
                         "ethInvestor is supposed to receive 95% of issued tokens");
            return token.balanceOf.call(owner);
        }).then(function(balance) {
             assert.equal(balance.toNumber(),
                          ownerBalance + tokenCount * 0.04 * 100000000,
                          "owner is supposed to receive 4% of tokens");
        }).then(done);
    });
});
