import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  let tokenAddress = "0xbB0E891AcAd61517F9114e6F9f3DB634cB260a91";

  // Deploy Private_sale Contract
  const psToken = await ethers.getContractFactory("Private_sale");
  const privatesaletoken = await psToken.deploy(tokenAddress);
  console.log("Private sale Address-> ", privatesaletoken.address);

  // Deploy TeamAdvisors Contract
  const teamaddvisorToken = await ethers.getContractFactory("TeamAdvisors");
  const teamadvisortoken = await teamaddvisorToken.deploy(tokenAddress);
  console.log("Team Advisors Address-> ", teamadvisortoken.address);

  // Deploy Rewards Contract
  const rewardsToken = await ethers.getContractFactory("Rewards");
  const rewardstoken = await rewardsToken.deploy(tokenAddress);
  console.log("Rewards Address-> ", rewardstoken.address);

  // Deploy Community Contract
  const communityToken = await ethers.getContractFactory("Community");
  const communitytoken = await communityToken.deploy(tokenAddress);
  console.log("Community Address-> ", communitytoken.address);

  await privatesaletoken.deployTransaction.wait(5);
  await teamadvisortoken.deployTransaction.wait(5);
  await rewardstoken.deployTransaction.wait(5);
  await communitytoken.deployTransaction.wait(5);

  await hre.run("verify:verify", {
    address: privatesaletoken.address,

    contract: ["contracts/Private_sale.sol:Private_sale"],
    constructorArguments: tokenAddress,
  });

  await hre.run("verify:verify", {
    address: teamadvisortoken.address,

    contract: ["contracts/TeamAdvisors.sol:TeamAdvisors"],
    constructorArguments: tokenAddress,
  });

  await hre.run("verify:verify", {
    address: rewardstoken.address,

    contract: ["contracts/Rewards.sol:Rewards"],
    constructorArguments: tokenAddress,
  });

  await hre.run("verify:verify", {
    address: communitytoken.address,

    contract: ["contracts/Community.sol:Community"],
    constructorArguments: tokenAddress,
  });
}

// Private_sale.sol
// TeamAdvisors.sol
// Rewards.sol
// Community.sol
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Deploy error-> ", error);
    process.exit(1);
  });
