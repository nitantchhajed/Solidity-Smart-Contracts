import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  let tokenAddress = "0xc3eF9aEe356737E1DB477Dd5188CaaB8F1a4bB7b";
  let daoAddress = "0x9a93DfCCA855d0ae111b2Ad1C48A6F1a96832dF8";

  const Token = await ethers.getContractFactory("BLC_Tokenomics");

  const token = await Token.deploy(tokenAddress, daoAddress);
  console.log("Tokenomics Address-> ", token.address);

  await token.deployTransaction.wait(5);

  await hre.run("verify:verify", {
    address: token.address,
    contract: "contracts/tokenomics.sol:Tokenomics",
    constructorArguments: [tokenAddress, daoAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Deploy error-> ", error);
    process.exit(1);
  });
