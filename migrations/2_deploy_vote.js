// const MyStringStore = artifacts.require("MyStringStore");
const Vote = artifacts.require("Vote");

module.exports = function(deployer, network) {
  // deployer.deploy(MyStringStore);
  if (network == "geth_docker_network_org1")
    deployer.deploy(Vote);
};