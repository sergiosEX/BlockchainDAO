const EnergyData1 = artifacts.require("EnergyData1");

module.exports = function(deployer, network, accounts) {
  if (network == "geth_docker_network_org2")
    deployer.deploy(EnergyData1);
};