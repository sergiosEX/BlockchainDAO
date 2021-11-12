const EnergyData2 = artifacts.require("EnergyData2");

module.exports = function(deployer, network, accounts) {
  if (network == "geth_docker_network_org3")
    deployer.deploy(EnergyData2);
};