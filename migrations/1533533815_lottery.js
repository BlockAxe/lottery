let Lottery = artifacts.require("./Lottery.sol");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(Lottery);
};
