const EnergyData = artifacts.require("EnergyData");

module.exports = function(deployer) {
  deployer.deploy(EnergyData);
};