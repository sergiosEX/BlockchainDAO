const EnergyData = artifacts.require("EnergyData");

module.exports = function(deployer, network, accounts) {
  if (network == "geth_docker_network_org1")
    deployer.deploy(EnergyData);
};