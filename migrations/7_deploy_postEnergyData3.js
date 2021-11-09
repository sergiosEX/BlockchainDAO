const EnergyData3 = artifacts.require("EnergyData3");

module.exports = function(deployer, network, accounts) {
  if (network == "geth_docker_network_org4")
    deployer.deploy(EnergyData3);
};