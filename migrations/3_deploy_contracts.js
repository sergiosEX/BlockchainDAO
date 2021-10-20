// const MyStringStore = artifacts.require("MyStringStore");
const Vote = artifacts.require("Vote");

module.exports = function(deployer) {
  // deployer.deploy(MyStringStore);
  deployer.deploy(Vote);
};