const Migrations = artifacts.require("Migrations");
const Todolist = artifacts.require("Todolist");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Todolist);
};