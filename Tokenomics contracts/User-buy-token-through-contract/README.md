# Sample Hardhat Project


*********************************************



Purpose

There are 6 contract 
BLC token contract: Transfer all the token to the 4 contracts and managing through ERC20 Token Contract

Private_sale, Community, Rewards, Team and advisors contract: Those contract have some certain amount of token and each user can buy token by self and pay some ethers for the tokens.

IBlcToken contract: Creating a Interface for BLC token contract




******************************************** 



This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts

npx hardhat coverage --temp build
```

---

Ethereum Network
#################################### Testnet Network ####################################

<!--
    Metamask Network Parameters
    Network Name: Goerli test network
    New RPC URL: https://goerli.infura.io/v3/
    Chain ID: 5
    Currency Symbol: GoerliETH
    Block Explorer URL: https://goerli.etherscan.io
-->

Deploy: npx hardhat run --network goerli scripts/deploy.ts
Verify: npx hardhat verify --network goerli <token.address>

---

Polygon Network
#################################### Testnet Network ####################################

<!--
    Metamask Network Parameters
    Network Name: Mumbai Testnet
    New RPC URL: https://polygon-mumbai.g.alchemy.com/v2/c8YTJ3O5Ku4wfSiJf5ft3oLj8y4r0G9R
    Chain ID: 80001
    Currency Symbol: MATIC
    Block Explorer URL: https://mumbai.polygonscan.com/
-->

Deploy: npx hardhat run --network polygon_mumbai scripts/deploy.ts
Verify: npx hardhat verify --network polygon_mumbai <token.address>

#################################### Mainnet Network ####################################

<!--
    Network Name: Polygon Mainnet
    New RPC URL: https://polygon-rpc.com/
    Chain ID: 137
    Currency Symbol: MATIC
    Block Explorer URL: https://polygonscan.com/
-->

Deploy: npx hardhat run --network matic scripts/deploy.ts
Verify: npx hardhat verify --network matic <token.address>

---
