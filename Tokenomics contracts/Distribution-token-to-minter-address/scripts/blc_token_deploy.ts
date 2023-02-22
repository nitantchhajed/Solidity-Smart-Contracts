import { ethers } from "hardhat";
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  let daoAddress = "0x9a93DfCCA855d0ae111b2Ad1C48A6F1a96832dF8";

  const Token = await ethers.getContractFactory("BLC_Token");
  const token = await Token.deploy(daoAddress);
  console.log("Token Address-> ", token.address);

  await token.deployTransaction.wait(5);

  await hre.run("verify:verify", {
    address: token.address,
    contract: "contracts/token.sol:Token",
    constructorArguments: [daoAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Deploy error-> ", error);
    process.exit(1);
  });

//Token Address: 0xEbc1D849cD0f492aD06D7883b167652332E9010B
