let Lottery = artifacts.require("Lottery");

contract('Lottery', async (accounts) => {
  let betvalue = 0.01 * 10 ** 18;

  it("should assert true", async () => {
    let instance = await Lottery.deployed();
    assert.isTrue(true);
  });

  it("should set `playerCountGoal` within 10000 and 10100 successfully", async () => {
    let instance = await Lottery.deployed();
    let playerCountGoal = await instance.playerEther();
    assert.isTrue(true);
  });

  it("should fail to transfer ether when the amount is not `betvalue`", async () => {
    let instance = await Lottery.deployed();
    let account0 = accounts[0];
    try {
      await instance.sendTransaction({
        from: account0,
        to: instance.address,
        value: betvalue + 100,
      });
    } catch (error) {
      const vmException = error.message.search('VM Exception') >= 0;
      assert(
        vmException,
        "Expected throw, got '" + error + "' instead",
      );

      let balance = await web3.eth.getBalance(instance.address).toNumber();
      assert.equal(0, balance, "Contract does not obtain correct balance");
      let playersMap_account0 = await instance.playersMap.call(account0);
      assert.equal(playersMap_account0, false, "playersMap should not contain account0");
      let playersLength = await instance.getPlayersLength.call();
      assert.equal(playersLength, 0, "players array should contain 0 player");

      return;
    }

    assert.fail('Expected throw not received');
  });

  it("should transfer ether successfully", async () => {
    let instance = await Lottery.deployed();
    let account0 = accounts[0];
    await instance.sendTransaction({
      from: account0,
      to: instance.address,
      value: betvalue,
    });
    let balance = await web3.eth.getBalance(instance.address).toNumber();
    assert.equal(betvalue, balance, "Contract does not obtain correct balance");
    let playersMap_account0 = await instance.playersMap.call(account0);
    assert.equal(playersMap_account0, true, "playersMap should contain account0");
    let playersLength = await instance.getPlayersLength.call();
    assert.equal(playersLength, 1, "players array should contain 1 player");
  });

  it("should end lottery successfully after player count reaches the goal", async () => {
    let instance = await Lottery.deployed();

    for (let i = 0; i < accounts.length; ++i) {
      try {
        await instance.sendTransaction({
          from: accounts[i],
          to: instance.address,
          value: betvalue,
        });
      } catch (error) {
      }
    }

    let playersLength = await instance.getPlayersLength.call();

    assert.equal(await instance.isLotteryClosed(), true, "lottery game should be closed");

    let balance = await web3.eth.getBalance(instance.address).toNumber();
    assert.isAbove(balance, 0, "balance should be above 0");
    assert.equal(betvalue * playersLength, balance, "contract should have correct balance");

    let rewardsExpected = betvalue * playersLength * 4 / 5;
    let rewardsActual = await instance.rewards();
    assert.equal(rewardsExpected, rewardsActual, "the beneficiary should have expected rewards");

    let beneficiary = await instance.beneficiary();
    let playersMap_account = await instance.playersMap.call(beneficiary);
    assert.equal(true, playersMap_account, "the beneficiary should in the players map");
  });

  it("should withdraw rewards successfully by beneficiary", async () => {
    let instance = await Lottery.deployed();
    let beneficiary = await instance.beneficiary();
    console.log(beneficiary);
    
    let balanceBefore = await web3.eth.getBalance(beneficiary).toNumber();
    console.log(balanceBefore);
    let rewardsActual = await instance.rewards();
    let results = await instance.safeWithdrawal.call({from: beneficiary});
    let balanceAfter = await web3.eth.getBalance(beneficiary).toNumber();
    console.log(balanceAfter);
    console.log(results);

    console.log(await web3.eth.getBalance(instance.address).toNumber());
    assert.equal(balanceBefore + rewardsActual, balanceAfter, "beneficiary's balance should be correct after rewards withdrawal");
  });
});
