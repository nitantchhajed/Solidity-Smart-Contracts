const Migrations = artifacts.require("Migrations");
const DStorage = artifacts.require("DStorage");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(DStorage);
};
