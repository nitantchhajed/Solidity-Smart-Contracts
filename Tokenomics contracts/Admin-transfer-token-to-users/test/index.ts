import { Provider } from "@ethersproject/abstract-provider";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Signer } from "ethers";
import { ethers } from "hardhat";
import { exit } from "process";

let day = 24 * 60 * 60;
let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

describe.only("Tokenomics Contracts", () => {
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let user4: SignerWithAddress;
  let user5: SignerWithAddress;
  let user6: SignerWithAddress;
  let user7: SignerWithAddress;
  let user8: SignerWithAddress;
  let user9: SignerWithAddress;
  let user10: SignerWithAddress;
  let user11: SignerWithAddress;
  let privateSaleAmt;
  let teamAdvisorAmt;
  let rewardsAmt;
  let communityAmt;

  async function basicMethod() {
    [
      deployer,
      owner,
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
    ] = await ethers.getSigners();

    // total suply value with power
    const supply = 1000000000;
    const max_supply = await decimal(supply);

    // Deploy Token Contract
    const tokens = await ethers.getContractFactory("BLC_Token");
    const hardhatToken = await tokens.deploy();

    // Deploy Private Sale Contract
    const private_sale = await ethers.getContractFactory("Private_sale");
    const saleHardhatToken = await private_sale.deploy(hardhatToken.address);

    // Deploy Team and Advisors Contract
    const team_advisors = await ethers.getContractFactory("TeamAdvisors");
    const teamAdvisorsHardhatToken = await team_advisors.deploy(
      hardhatToken.address
    );

    // Deploy Rewards Contract
    const rewards = await ethers.getContractFactory("Rewards");
    const rewardsHardhatToken = await rewards.deploy(hardhatToken.address);

    // Deploy Community, Liquidity, Partners Contract
    const community = await ethers.getContractFactory("Community");
    const communityHardhatToken = await community.deploy(hardhatToken.address);

    // Add contracts Amount
    privateSaleAmt = await decimal(100000000);
    await hardhatToken
      .connect(deployer)
      .addContracts(saleHardhatToken.address, privateSaleAmt);

    teamAdvisorAmt = await decimal(150000000);
    await hardhatToken
      .connect(deployer)
      .addContracts(teamAdvisorsHardhatToken.address, teamAdvisorAmt);

    rewardsAmt = await decimal(300000000);
    await hardhatToken
      .connect(deployer)
      .addContracts(rewardsHardhatToken.address, rewardsAmt);

    communityAmt = await decimal(450000000);
    await hardhatToken
      .connect(deployer)
      .addContracts(communityHardhatToken.address, communityAmt);

    return {
      deployer,
      owner,
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
      max_supply,
      privateSaleAmt,
      teamAdvisorAmt,
      rewardsAmt,
      communityAmt,
      hardhatToken,
      saleHardhatToken,
      teamAdvisorsHardhatToken,
      rewardsHardhatToken,
      communityHardhatToken,
    };
  }

  /*  
    Check Tokenomics Testing
  */

  function decimal(value: any) {
    const powValue = BigNumber.from("10").pow(18);
    return BigNumber.from(value).mul(powValue);
  }

  describe("Basic Token Testing", () => {
    it("Should check token Name", async () => {
      const { hardhatToken } = await loadFixture(basicMethod);
      expect(await hardhatToken.name()).to.be.equal("BLUE token");
    });

    it("Should check token Symbol", async () => {
      const { hardhatToken } = await loadFixture(basicMethod);
      expect(await hardhatToken.symbol()).to.be.equal("BLUE");
    });

    it("Should check token Decimals", async () => {
      const { hardhatToken } = await loadFixture(basicMethod);
      expect(await hardhatToken.decimals()).to.be.equal(BigNumber.from("18"));
    });

    it("Should check token Totalsupply", async () => {
      const { deployer, hardhatToken, max_supply } = await loadFixture(
        basicMethod
      );
      expect(await hardhatToken.totalSupply()).to.be.equal(
        BigNumber.from(BigNumber.from(max_supply))
      );
    });

    it("Should check token Max_supply", async () => {
      const { hardhatToken, max_supply } = await loadFixture(basicMethod);
      expect(await hardhatToken.max_supply()).to.be.equal(
        BigNumber.from(max_supply)
      );
    });

    it("Should check token contract deployer balance", async () => {
      const { deployer, hardhatToken } = await loadFixture(basicMethod);
      expect(await hardhatToken.balanceOf(deployer.address)).to.be.equal(
        BigNumber.from("0")
      );
    });

    it("Should check token Transfer: Deployer to user1", async () => {
      const { deployer, user1, hardhatToken } = await loadFixture(basicMethod);
      await hardhatToken.transfer(user1.address, BigNumber.from("0"));
      expect(await hardhatToken.balanceOf(deployer.address)).to.be.equal(
        BigNumber.from("0")
      );
      expect(await hardhatToken.balanceOf(user1.address)).to.be.equal(
        BigNumber.from("0")
      );
    });

    it("Should check token approve and allowance to user1", async () => {
      const { deployer, user1, hardhatToken } = await loadFixture(basicMethod);
      await hardhatToken
        .connect(deployer)
        .approve(user1.address, BigNumber.from("50000000"));
      expect(
        await hardhatToken.allowance(deployer.address, user1.address)
      ).to.be.equal(BigNumber.from("50000000"));
    });

    it("Should check transfer ownership", async () => {
      const { deployer, user1, hardhatToken } = await loadFixture(basicMethod);
      expect(await hardhatToken.owner()).to.equal(deployer.address);

      await hardhatToken.connect(deployer).transferOwnerShip(owner.address);

      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should check Revert Methods", async () => {
      const { deployer, user1, hardhatToken, saleHardhatToken } =
        await loadFixture(basicMethod);

      // only owner can run methods
      await expect(hardhatToken.connect(user1).transferOwnerShip(owner.address))
        .to.be.reverted;

      await expect(
        hardhatToken
          .connect(user1)
          .addContracts(saleHardhatToken.address, decimal(10000))
      ).to.be.reverted;

      // work fine with continue
      await expect(
        hardhatToken
          .connect(deployer)
          .addContracts(saleHardhatToken.address, decimal(0))
      ).to.not.be.reverted;

      await hardhatToken
        .connect(deployer)
        .addContracts(saleHardhatToken.address, decimal(0));

      // amount is not sufficient
      await expect(
        hardhatToken
          .connect(deployer)
          .addContracts(saleHardhatToken.address, decimal(1000000000))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Contract Balance transfer", () => {
    it("Should check tokens transfers to all contracts", async () => {
      const {
        hardhatToken,
        saleHardhatToken,
        teamAdvisorsHardhatToken,
        rewardsHardhatToken,
        communityHardhatToken,
        privateSaleAmt,
        teamAdvisorAmt,
        rewardsAmt,
        communityAmt,
      } = await loadFixture(basicMethod);

      // check token contract Balance
      expect(await hardhatToken.balanceOf(deployer.address)).to.equal(
        BigNumber.from(0)
      );

      // check sale contract Balance
      expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
        BigNumber.from(privateSaleAmt)
      );

      // check teamAdvisors contract Balance
      expect(
        await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
      ).to.equal(BigNumber.from(teamAdvisorAmt));

      // check rewards contract Balance
      expect(
        await hardhatToken.balanceOf(rewardsHardhatToken.address)
      ).to.equal(BigNumber.from(rewardsAmt));

      // check communitysale contract Balance
      expect(
        await hardhatToken.balanceOf(communityHardhatToken.address)
      ).to.equal(BigNumber.from(communityAmt));

      // console.log(
      //   await hardhatToken.balanceOf(deployer.address),
      //   await hardhatToken.balanceOf(saleHardhatToken.address),
      //   await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address),
      //   await hardhatToken.balanceOf(rewardsHardhatToken.address),
      //   await hardhatToken.balanceOf(communityHardhatToken.address)
      // );
    });
  });

  describe("Private Sale Contract", () => {
    describe("Add Sale Type and Token Amounts", () => {
      it("Should check All Sale Type add", async () => {
        const { saleHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        let sale1 = await saleHardhatToken.saletypes(1);
        let sale2 = await saleHardhatToken.saletypes(2);
        let sale3 = await saleHardhatToken.saletypes(3);
        expect(sale1).to.have.deep.members([
          "Private Sale 1",
          BigNumber.from(12),
          BigNumber.from(6),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(sale2).to.have.deep.members([
          "Private Sale 2",
          BigNumber.from(9),
          BigNumber.from(6),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(sale3).to.have.deep.members([
          "Launchpad IDO",
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);
      });

      it("Should check All Token Amount add", async () => {
        const { saleHardhatToken } = await loadFixture(basicMethod);

        let token1 = await saleHardhatToken.tokenamounts(1);
        let token2 = await saleHardhatToken.tokenamounts(2);
        let token3 = await saleHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(decimal(20000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(20000000)),
          BigNumber.from(decimal(3333333)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(decimal(30000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(30000000)),
          BigNumber.from(decimal(5000000)),
        ]);

        expect(token3).to.have.deep.members([
          BigNumber.from(decimal(50000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(50000000)),
          BigNumber.from(decimal(50000000)),
        ]);
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods", async () => {
        const { saleHardhatToken, user2, user3, user4 } = await loadFixture(
          basicMethod
        );

        let saleId = 1;
        await expect(saleHardhatToken.connect(user2).startTime(saleId)).to.be
          .reverted;
        await expect(saleHardhatToken.connect(user3).endTime(saleId)).to.be
          .reverted;
        await expect(
          saleHardhatToken
            .connect(user4)
            .transferToken(saleId, user2.address, 10000)
        ).to.be.reverted;
      });

      it("Should check Start/End Time not over", async () => {
        const { saleHardhatToken, deployer, user2 } = await loadFixture(
          basicMethod
        );

        let saleId = 1;

        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, 100)
        ).to.be.revertedWith("Sale not Start!");

        await saleHardhatToken.startTime(saleId);
        await expect(saleHardhatToken.endTime(saleId)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken.endTime(saleId);
        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, 100)
        ).to.be.revertedWith("Sale is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { saleHardhatToken, user2 } = await loadFixture(basicMethod);

        let saleId = 1;
        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 180;

        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, decimal(1400))
        ).to.be.revertedWith("Sale not Start!");

        //start sale
        await saleHardhatToken.startTime(saleId);

        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, decimal(1400))
        ).to.be.revertedWith("Cliff is not Over!");

        await time.increaseTo(currentTime.add(increaseTime * day));

        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, decimal(33333333))
        ).to.be.revertedWith("Insufficient Token!");

        //end sale
        await saleHardhatToken.endTime(saleId);

        await expect(
          saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user2.address, 1400)
        ).to.be.revertedWith("Sale is Over!");
      });
    });

    describe("Transfer Tokens to multiple users", () => {
      it("Should check Private Sale 1 user tokens", async () => {
        const { hardhatToken, saleHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let saleId = 1;
        let cliffMonth = 12;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await saleHardhatToken.startTime(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(saleHardhatToken.address);

        // sale1 user buy token
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        expect(
          await saleHardhatToken.userTokenBal(user1.address, saleId)
        ).to.equal(decimal(transferAmt));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );

        // sale2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user2.address, decimal(transferAmt1));

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(decimal(transferAmt1));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );
      });

      it("Should check Private Sale 2 user tokens", async () => {
        const { hardhatToken, saleHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let saleId = 2;
        let cliffMonth = 9;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await saleHardhatToken.startTime(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(saleHardhatToken.address);

        // sale1 user buy token
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        expect(
          await saleHardhatToken.userTokenBal(user1.address, saleId)
        ).to.equal(decimal(transferAmt));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );

        // sale2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user2.address, decimal(transferAmt1));

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(decimal(transferAmt1));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );
      });

      it("Should check Launched IDO user tokens", async () => {
        const { hardhatToken, saleHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let saleId = 3;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await saleHardhatToken.startTime(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(saleHardhatToken.address);

        // sale1 user buy token
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        expect(
          await saleHardhatToken.userTokenBal(user1.address, saleId)
        ).to.equal(decimal(transferAmt));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );

        // sale2 user buy token
        let transferAmt1 = 902;
        transferAmt += transferAmt1;
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user2.address, decimal(transferAmt1));

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(decimal(transferAmt1));

        expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
          oldBalance.sub(decimal(transferAmt))
        );
      });
    });

    describe("Distribution Calculations", () => {
      it("Should check in Private Sale 1", async () => {
        const { saleHardhatToken, user1 } = await loadFixture(basicMethod);
        let saleId = 1;
        let vestedMonth = 6;
        let clifdays = 12 * 30 + 1;
        await saleHardhatToken.connect(deployer).startTime(saleId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await saleHardhatToken.tokenamounts(saleId);

          await saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(3333333));
          let remainAmt = tokenamounts.remainToken.sub(decimal(3333333));
          if (i == 5) {
            unlockAmt = unlockAmt.add(BigNumber.from(remainAmt));
            remainAmt = BigNumber.from(0);
          }

          expect(
            await saleHardhatToken.tokenamounts(saleId)
          ).to.have.deep.members([
            decimal(20000000),
            unlockAmt,
            remainAmt,
            decimal(3333333),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }

        // console.log(await saleHardhatToken.tokenamounts(1));
      });

      it("Should check in Private Sale 2", async () => {
        const { saleHardhatToken, user1 } = await loadFixture(basicMethod);

        let saleId = 2;
        let vestedMonth = 6;
        let clifdays = 9 * 30 + 1;
        await saleHardhatToken.connect(deployer).startTime(saleId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await saleHardhatToken.tokenamounts(saleId);

          await saleHardhatToken
            .connect(deployer)
            .transferToken(saleId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(5000000));
          let remainAmt = tokenamounts.remainToken.sub(decimal(5000000));
          if (i == 5) {
            unlockAmt = unlockAmt.add(BigNumber.from(remainAmt));
            remainAmt = BigNumber.from(0);
          }

          expect(
            await saleHardhatToken.tokenamounts(saleId)
          ).to.have.deep.members([
            decimal(30000000),
            unlockAmt,
            remainAmt,
            decimal(5000000),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }
        // console.log(await saleHardhatToken.tokenamounts(2));
      });

      it("Should check in Launched IDO", async () => {
        const { saleHardhatToken, user1 } = await loadFixture(basicMethod);

        let saleId = 3;
        await saleHardhatToken.connect(deployer).startTime(saleId);

        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, 0);

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(50000000),
          decimal(50000000),
          decimal(0),
          decimal(50000000),
        ]);

        // console.log(await saleHardhatToken.tokenamounts(3));
      });
    });

    describe("Skipping Months", () => {
      //
      it("Should check in Private Sale 1", async () => {
        const { saleHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let saleId = 1;
        let cliffMonth = 12;
        let transferAmt = 100;
        let totalToken = 20000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 3333333;
        await saleHardhatToken.startTime(saleId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 150;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 6 - transferAmt * 4 + 2; //2 is modulus value
        remaining = totalToken - averageToken * 6 - 2; //2 is modulus value

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Private Sale 2", async () => {
        const { saleHardhatToken, user1 } = await loadFixture(basicMethod);

        let saleId = 2;
        let cliffMonth = 9;
        let transferAmt = 100;
        let totalToken = 30000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 5000000;
        await saleHardhatToken.startTime(saleId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 150;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 6 - transferAmt * 4; //2 is modulus value
        remaining = totalToken - averageToken * 6; //2 is modulus value

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Launched IDO", async () => {
        const { saleHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let saleId = 3;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 50000000;

        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 50000000;
        await saleHardhatToken.startTime(saleId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;
        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken - transferAmt * 2;
        remaining = 0;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken - transferAmt * 3;
        remaining = 0;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 150;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await saleHardhatToken
          .connect(deployer)
          .transferToken(saleId, user1.address, decimal(transferAmt));

        unlockToken = averageToken - transferAmt * 4;
        remaining = 0;

        expect(
          await saleHardhatToken.tokenamounts(saleId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });
    });
  });

  describe("Team and Advisors Contract", () => {
    describe("Add Distribution Type and Token Amounts", () => {
      it("Should check All Distribution Type Add", async () => {
        const { teamAdvisorsHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        let sale1 = await teamAdvisorsHardhatToken.teamadvisors(1);
        let sale2 = await teamAdvisorsHardhatToken.teamadvisors(2);
        expect(sale1).to.have.deep.members([
          "Team",
          BigNumber.from(12),
          BigNumber.from(12),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(sale2).to.have.deep.members([
          "Advisors",
          BigNumber.from(12),
          BigNumber.from(12),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);
      });

      it("Should check All Token Amount add", async () => {
        const { teamAdvisorsHardhatToken } = await loadFixture(basicMethod);

        let token1 = await teamAdvisorsHardhatToken.tokenamounts(1);
        let token2 = await teamAdvisorsHardhatToken.tokenamounts(2);
        expect(token1).to.have.deep.members([
          BigNumber.from(decimal(120000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(120000000)),
          BigNumber.from(decimal(10000000)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(decimal(30000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(30000000)),
          BigNumber.from(decimal(2500000)),
        ]);
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods", async () => {
        const { teamAdvisorsHardhatToken, user2, user3, user4 } =
          await loadFixture(basicMethod);

        let distrId = 1;
        await expect(teamAdvisorsHardhatToken.connect(user2).startTime(distrId))
          .to.be.reverted;
        await expect(teamAdvisorsHardhatToken.connect(user3).endTime(distrId))
          .to.be.reverted;
        await expect(
          teamAdvisorsHardhatToken
            .connect(user4)
            .transferToken(distrId, user2.address, 10000)
        ).to.be.reverted;
      });

      it("Should check Start/End Time not over", async () => {
        const { teamAdvisorsHardhatToken, deployer, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;

        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution not Start!");

        await teamAdvisorsHardhatToken.startTime(distrId);
        await expect(
          teamAdvisorsHardhatToken.endTime(distrId)
        ).to.be.revertedWith("Cliff/Vested not Over!");

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 365;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken.endTime(distrId);
        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { teamAdvisorsHardhatToken, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;
        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 366;

        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.be.revertedWith("Distribution not Start!");

        // start distribution
        await teamAdvisorsHardhatToken.startTime(distrId);

        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.be.revertedWith("Cliff is not Over!");

        await time.increaseTo(currentTime.add(increaseTime * day));

        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(120000001))
        ).to.be.revertedWith("Insufficient Token!");

        // end distribution
        await teamAdvisorsHardhatToken.endTime(distrId);

        await expect(
          teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 1400)
        ).to.be.revertedWith("Distribution is Over!");
      });
    });

    describe("Transfer Tokens to multiple users", () => {
      it("Should check Team user tokens", async () => {
        const { hardhatToken, teamAdvisorsHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 1;
        let cliffMonth = 12;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await teamAdvisorsHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );

        // sale1 user buy token
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // sale2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });

      it("Should check Advisors user tokens", async () => {
        const { hardhatToken, teamAdvisorsHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 2;
        let cliffMonth = 12;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await teamAdvisorsHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );

        // sale1 user buy token
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // sale2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });
    });

    describe("Distribution Calculations", () => {
      it("Should check in Team", async () => {
        const { teamAdvisorsHardhatToken, user1 } = await loadFixture(
          basicMethod
        );
        let distrId = 1;
        let vestedMonth = 12;
        let clifdays = 12 * 30 + 1;
        await teamAdvisorsHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await teamAdvisorsHardhatToken.tokenamounts(
            distrId
          );

          await teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(10000000));
          let remainAmt = tokenamounts.remainToken.sub(decimal(10000000));

          expect(
            await teamAdvisorsHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(120000000),
            unlockAmt,
            remainAmt,
            decimal(10000000),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }

        // console.log(await teamAdvisorsHardhatToken.tokenamounts(1));
      });

      it("Should check in Advisors", async () => {
        const { teamAdvisorsHardhatToken, user1 } = await loadFixture(
          basicMethod
        );

        let distrId = 2;
        let vestedMonth = 12;
        let clifdays = 12 * 30 + 1;
        await teamAdvisorsHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await teamAdvisorsHardhatToken.tokenamounts(
            distrId
          );

          await teamAdvisorsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(2500000));
          let remainAmt = tokenamounts.remainToken.sub(decimal(2500000));

          expect(
            await teamAdvisorsHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(30000000),
            unlockAmt,
            remainAmt,
            decimal(2500000),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }
        // console.log(await teamAdvisorsHardhatToken.tokenamounts(2));
      });
    });

    describe("Skipping Months", () => {
      //
      it("Should check in Team", async () => {
        const { teamAdvisorsHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;
        let cliffMonth = 12;
        let transferAmt = 100;
        let totalToken = 120000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 10000000;
        await teamAdvisorsHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 7 - transferAmt * 4;
        remaining = totalToken - averageToken * 7;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Advisor", async () => {
        const { teamAdvisorsHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 2;
        let cliffMonth = 12;
        let transferAmt = 100;
        let totalToken = 30000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 2500000;
        await teamAdvisorsHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await teamAdvisorsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 7 - transferAmt * 4;
        remaining = totalToken - averageToken * 7;

        expect(
          await teamAdvisorsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });
    });
  });

  describe("Comunities, Liquidity, Patners Contract", () => {
    describe("Add Distribution Type and Token Amounts", () => {
      it("Should check All Distribution Type add", async () => {
        const { communityHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        let distr1 = await communityHardhatToken.communities(1);
        let distr2 = await communityHardhatToken.communities(2);
        let distr3 = await communityHardhatToken.communities(3);
        expect(distr1).to.have.deep.members([
          "Community Treasury",
          BigNumber.from(0),
          BigNumber.from(48),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(distr2).to.have.deep.members([
          "Liquidity",
          BigNumber.from(0),
          BigNumber.from(4),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(distr3).to.have.deep.members([
          "Partners",
          BigNumber.from(6),
          BigNumber.from(15),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);
      });

      it("Should check All Token Amount add", async () => {
        const { communityHardhatToken } = await loadFixture(basicMethod);

        let token1 = await communityHardhatToken.tokenamounts(1);
        let token2 = await communityHardhatToken.tokenamounts(2);
        let token3 = await communityHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(decimal(250000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(250000000)),
          BigNumber.from(decimal(5208333)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(decimal(100000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(100000000)),
          BigNumber.from(decimal(25000000)),
        ]);

        expect(token3).to.have.deep.members([
          BigNumber.from(decimal(100000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(100000000)),
          BigNumber.from(decimal(6666666)),
        ]);
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods", async () => {
        const { communityHardhatToken, user2, user3, user4 } =
          await loadFixture(basicMethod);

        let distrId = 1;
        await expect(communityHardhatToken.connect(user2).startTime(distrId)).to
          .be.reverted;
        await expect(communityHardhatToken.connect(user3).endTime(distrId)).to
          .be.reverted;
        await expect(
          communityHardhatToken
            .connect(user4)
            .transferToken(distrId, user2.address, 10000)
        ).to.be.reverted;
      });

      it("Should check Start/End Time not over", async () => {
        const { communityHardhatToken, deployer, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;

        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution not Start!");

        await communityHardhatToken.startTime(distrId);
        await expect(communityHardhatToken.endTime(distrId)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1460;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken.endTime(distrId);
        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { communityHardhatToken, user2 } = await loadFixture(basicMethod);

        let distrId = 1;
        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1460;
        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.be.revertedWith("Distribution not Start!");

        //start distribution
        await communityHardhatToken.startTime(distrId);
        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.not.be.revertedWith("Cliff is not Over!");

        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(2500000001))
        ).to.be.revertedWith("Insufficient Token!");

        //end distribution
        await communityHardhatToken.endTime(distrId);
        await expect(
          communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 1400)
        ).to.be.revertedWith("Distribution is Over!");
      });
    });

    describe("Transfer Tokens to multiple users", () => {
      it("Should check Community Treasure user tokens", async () => {
        const { hardhatToken, communityHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 1;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await communityHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        // distr1 user buy token
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await communityHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });

      it("Should check Liquidity user tokens", async () => {
        const { hardhatToken, communityHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 2;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await communityHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        // distr1 user buy token
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await communityHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });

      it("Should check Patners user tokens", async () => {
        const { hardhatToken, communityHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 3;
        let cliffMonth = 6;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await communityHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        // distr1 user buy token
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await communityHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 902;
        transferAmt += transferAmt1;
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(communityHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });
    });

    describe("Distribution Calculations", () => {
      it("Should check in Community Treasure", async () => {
        const { communityHardhatToken, user1 } = await loadFixture(basicMethod);
        let distrId = 1;
        let vestedMonth = 48;
        let clifdays = 0 * 30 + 1;
        await communityHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await communityHardhatToken.tokenamounts(distrId);

          await communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(5208333));
          let remainAmt = tokenamounts.remainToken.sub(decimal(5208333));
          if (i == vestedMonth - 1) {
            unlockAmt = unlockAmt.add(BigNumber.from(remainAmt));
            remainAmt = BigNumber.from(0);
          }

          expect(
            await communityHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(250000000),
            unlockAmt,
            remainAmt,
            decimal(5208333),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }

        // console.log(await communityHardhatToken.tokenamounts(1));
      });

      it("Should check in Liquidity", async () => {
        const { communityHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 2;
        let vestedMonth = 4;
        let clifdays = 0 * 30 + 1;
        await communityHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await communityHardhatToken.tokenamounts(distrId);

          await communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(25000000));
          let remainAmt = tokenamounts.remainToken.sub(decimal(25000000));

          expect(
            await communityHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(100000000),
            unlockAmt,
            remainAmt,
            decimal(25000000),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }
        // console.log(await communityHardhatToken.tokenamounts(2));
      });

      it("Should check in Patners", async () => {
        const { communityHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 3;
        let vestedMonth = 15;
        let clifdays = 6 * 30 + 1;
        await communityHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await communityHardhatToken.tokenamounts(distrId);

          await communityHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(6666666));
          let remainAmt = tokenamounts.remainToken.sub(decimal(6666666));
          if (i == vestedMonth - 1) {
            unlockAmt = unlockAmt.add(BigNumber.from(remainAmt));
            remainAmt = BigNumber.from(0);
          }

          expect(
            await communityHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(100000000),
            unlockAmt,
            remainAmt,
            decimal(6666666),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }

        // console.log(await communityHardhatToken.tokenamounts(3));
      });
    });

    describe("Skipping Months", () => {
      //
      it("Should check in Community Treasure", async () => {
        const { communityHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 250000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 5208333;
        await communityHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 1460;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 48 - transferAmt * 4 + 16; //16 is modulus value
        remaining = totalToken - averageToken * 48 - 16; //16 is modulus value

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Liquidity", async () => {
        const { communityHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 2;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 100000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 25000000;
        await communityHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken * 2 - transferAmt * 1;
        let remaining = totalToken - averageToken * 2;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Patners", async () => {
        const { communityHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 3;
        let cliffMonth = 6;
        let transferAmt = 100;
        let totalToken = 100000000;

        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 6666666;
        await communityHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken * 1 - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 450;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await communityHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 15 - transferAmt * 4 + 10; // 10 is modulus value
        remaining = totalToken - averageToken * 15 - 10; // 10 is modulus value

        expect(
          await communityHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });
    });
  });

  describe("Staking, Wallet airdrop, Marketplace airdrop rewards Contract", () => {
    describe("Add Distribution Type and Token Amounts", () => {
      it("Should check All Distribution Type add", async () => {
        const { rewardsHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        let distr1 = await rewardsHardhatToken.rewards(1);
        let distr2 = await rewardsHardhatToken.rewards(2);
        let distr3 = await rewardsHardhatToken.rewards(3);
        expect(distr1).to.have.deep.members([
          "Staking rewards",
          BigNumber.from(0),
          BigNumber.from(60),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(distr2).to.have.deep.members([
          "Wallet airdrop rewards",
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(distr3).to.have.deep.members([
          "Marketplace airdrop rewards",
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);
      });

      it("Should check All Token Amount add", async () => {
        const { rewardsHardhatToken } = await loadFixture(basicMethod);

        let token1 = await rewardsHardhatToken.tokenamounts(1);
        let token2 = await rewardsHardhatToken.tokenamounts(2);
        let token3 = await rewardsHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(decimal(240000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(240000000)),
          BigNumber.from(decimal(4000000)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(decimal(30000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(30000000)),
          BigNumber.from(decimal(30000000)),
        ]);

        expect(token3).to.have.deep.members([
          BigNumber.from(decimal(30000000)),
          BigNumber.from(0),
          BigNumber.from(decimal(30000000)),
          BigNumber.from(decimal(30000000)),
        ]);
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods", async () => {
        const { rewardsHardhatToken, user2, user3, user4 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;
        await expect(rewardsHardhatToken.connect(user2).startTime(distrId)).to
          .be.reverted;
        await expect(rewardsHardhatToken.connect(user3).endTime(distrId)).to.be
          .reverted;
        await expect(
          rewardsHardhatToken
            .connect(user4)
            .transferToken(distrId, user2.address, 10000)
        ).to.be.reverted;
      });

      it("Should check Start/End Time not over", async () => {
        const { rewardsHardhatToken, deployer, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;

        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution not Start!");

        await rewardsHardhatToken.startTime(distrId);
        await expect(rewardsHardhatToken.endTime(distrId)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1825;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.endTime(distrId);
        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 100)
        ).to.be.revertedWith("Distribution is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { rewardsHardhatToken, user2 } = await loadFixture(basicMethod);

        let distrId = 1;
        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1825;
        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.be.revertedWith("Distribution not Start!");

        //start distribution
        await rewardsHardhatToken.startTime(distrId);
        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(1400))
        ).to.not.be.revertedWith("Cliff is not Over!");

        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, decimal(2500000001))
        ).to.be.revertedWith("Insufficient Token!");

        //end distribution
        await rewardsHardhatToken.endTime(distrId);
        await expect(
          rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user2.address, 1400)
        ).to.be.revertedWith("Distribution is Over!");
      });
    });

    describe("Transfer Tokens to multiple users", () => {
      it("Should check Staking rewards user tokens", async () => {
        const { hardhatToken, rewardsHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 1;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await rewardsHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        // distr1 user buy token
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await rewardsHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });

      it("Should check Wallet airdrop rewards user tokens", async () => {
        const { hardhatToken, rewardsHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 2;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await rewardsHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        // distr1 user buy token
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await rewardsHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 569;
        transferAmt += transferAmt1;
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });

      it("Should check Marketplace airdrop rewards user tokens", async () => {
        const { hardhatToken, rewardsHardhatToken, user1, user2 } =
          await loadFixture(basicMethod);

        let distrId = 3;
        let cliffMonth = 0;
        let transferAmt = 125;
        let clifdays = cliffMonth * 31 + 1;
        await rewardsHardhatToken.startTime(distrId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        let oldBalance = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        // distr1 user buy token
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        expect(
          await rewardsHardhatToken.userTokenBal(user1.address, distrId)
        ).to.equal(decimal(transferAmt));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));

        // distr2 user buy token
        let transferAmt1 = 902;
        transferAmt += transferAmt1;
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user2.address, decimal(transferAmt1));

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, distrId)
        ).to.equal(decimal(transferAmt1));

        expect(
          await hardhatToken.balanceOf(rewardsHardhatToken.address)
        ).to.equal(oldBalance.sub(decimal(transferAmt)));
      });
    });

    describe("Distribution Calculations", () => {
      it("Should check in Staking rewards", async () => {
        const { rewardsHardhatToken, user1 } = await loadFixture(basicMethod);
        let distrId = 1;
        let vestedMonth = 60;
        let clifdays = 0 * 30 + 1;
        await rewardsHardhatToken.connect(deployer).startTime(distrId);

        for (let i = 0; i < vestedMonth; i++) {
          let increaseTime = clifdays + 30 * i;
          await time.increaseTo(currentTime.add(increaseTime * day));

          let tokenamounts = await rewardsHardhatToken.tokenamounts(distrId);

          await rewardsHardhatToken
            .connect(deployer)
            .transferToken(distrId, user1.address, 0);

          let unlockAmt = tokenamounts.unlockToken.add(decimal(4000000));
          let remainAmt = tokenamounts.remainToken.sub(decimal(4000000));

          expect(
            await rewardsHardhatToken.tokenamounts(distrId)
          ).to.have.deep.members([
            decimal(240000000),
            unlockAmt,
            remainAmt,
            decimal(4000000),
          ]);

          // console.log(i, unlockAmt, remainAmt);
        }

        // console.log(await rewardsHardhatToken.tokenamounts(1));
      });

      it("Should check in Wallet airdrop rewards", async () => {
        const { rewardsHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 2;
        await rewardsHardhatToken.connect(deployer).startTime(distrId);
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, 0);

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(30000000),
          decimal(30000000),
          decimal(0),
          decimal(30000000),
        ]);

        // console.log(i, unlockAmt, remainAmt);
        // console.log(await rewardsHardhatToken.tokenamounts(2));
      });

      it("Should check in Marketplace airdrop rewards", async () => {
        const { rewardsHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 3;
        await rewardsHardhatToken.connect(deployer).startTime(distrId);
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, 0);

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(30000000),
          decimal(30000000),
          decimal(0),
          decimal(30000000),
        ]);
        // console.log(i, unlockAmt, remainAmt);

        // console.log(await rewardsHardhatToken.tokenamounts(3));
      });
    });

    describe("Skipping Months", () => {
      //
      it("Should check in Staking rewards", async () => {
        const { rewardsHardhatToken, user1, user2 } = await loadFixture(
          basicMethod
        );

        let distrId = 1;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 240000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 4000000;
        await rewardsHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken * 1;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 3 - transferAmt * 2;
        remaining = totalToken - averageToken * 3;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 3rd time
        increaseTime = clifdays + 120;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 5 - transferAmt * 3;
        remaining = totalToken - averageToken * 5;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 4th time
        increaseTime = clifdays + 1825;
        await time.increaseTo(currentTime.add(increaseTime * day));

        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken * 60 - transferAmt * 4;
        remaining = totalToken - averageToken * 60;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Wallet airdrop rewards", async () => {
        const { rewardsHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 2;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 30000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 30000000;
        await rewardsHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken - transferAmt * 2;
        remaining = totalToken - averageToken;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });

      it("Should check in Marketplace airdrop rewards", async () => {
        const { rewardsHardhatToken, user1 } = await loadFixture(basicMethod);

        let distrId = 3;
        let cliffMonth = 0;
        let transferAmt = 100;
        let totalToken = 30000000;
        let clifdays = cliffMonth * 31 + 1;
        let averageToken = 30000000;
        await rewardsHardhatToken.startTime(distrId);

        // 1st time
        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        let unlockToken = averageToken - transferAmt * 1;
        let remaining = totalToken - averageToken;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);

        // 2nd time and skipp 1month
        increaseTime = clifdays + 60;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken
          .connect(deployer)
          .transferToken(distrId, user1.address, decimal(transferAmt));

        unlockToken = averageToken - transferAmt * 2;
        remaining = totalToken - averageToken;

        expect(
          await rewardsHardhatToken.tokenamounts(distrId)
        ).to.have.deep.members([
          decimal(totalToken),
          decimal(unlockToken),
          decimal(remaining),
          decimal(averageToken),
        ]);
      });
    });
  });

  describe("Transfer OwnerShip and check event", () => {
    it("Transfer ownership Event in Private Sale ", async () => {
      const { saleHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      expect(
        await saleHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);

      let event = await saleHardhatToken
        .connect(deployer)
        .transferOwnerShip(owner.address);

      expect(event)
        .to.emit(saleHardhatToken, "TransferOwnerShip")
        .withArgs(deployer.address, owner.address);

      expect(
        await saleHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(false);
      expect(
        await saleHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Transfer ownership Event in Team and Advisor Contract ", async () => {
      const { teamAdvisorsHardhatToken } = await loadFixture(basicMethod);
      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      expect(
        await teamAdvisorsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);

      let event = await teamAdvisorsHardhatToken
        .connect(deployer)
        .transferOwnerShip(owner.address);

      expect(event)
        .to.emit(teamAdvisorsHardhatToken, "TransferOwnerShip")
        .withArgs(deployer.address, owner.address);

      expect(
        await teamAdvisorsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(false);
      expect(
        await teamAdvisorsHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Transfer ownership Event in Rewards ", async () => {
      const { rewardsHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      expect(
        await rewardsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);

      let event = await rewardsHardhatToken
        .connect(deployer)
        .transferOwnerShip(owner.address);

      expect(event)
        .to.emit(rewardsHardhatToken, "TransferOwnerShip")
        .withArgs(deployer.address, owner.address);

      expect(
        await rewardsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(false);
      expect(
        await rewardsHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Transfer ownership Event in Community ", async () => {
      const { communityHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      expect(
        await communityHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      let event = await communityHardhatToken
        .connect(deployer)
        .transferOwnerShip(owner.address);

      expect(event)
        .to.emit(communityHardhatToken, "TransferOwnerShip")
        .withArgs(deployer.address, owner.address);

      expect(
        await communityHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(false);
      expect(
        await communityHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });
  });

  describe("Add new Admins", () => {
    it("Should check new admin add with asign role in Private Sale Contract", async () => {
      const { saleHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      await saleHardhatToken.connect(deployer).addAdmins(owner.address);

      expect(
        await saleHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(
        await saleHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Should check new admin add with asign role in Rewards Contract ", async () => {
      const { rewardsHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      await rewardsHardhatToken.connect(deployer).addAdmins(owner.address);

      expect(
        await rewardsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(
        await rewardsHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Should check new admin add with asign role in Team and Advisor Contract ", async () => {
      const { teamAdvisorsHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      await teamAdvisorsHardhatToken.connect(deployer).addAdmins(owner.address);

      expect(
        await teamAdvisorsHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(
        await teamAdvisorsHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });

    it("Should check new admin add with asign role in Community Contract ", async () => {
      const { communityHardhatToken } = await loadFixture(basicMethod);

      const ADMIN_ROLE = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("ADMIN_ROLE")
      );

      await communityHardhatToken.connect(deployer).addAdmins(owner.address);

      expect(
        await communityHardhatToken.hasRole(ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(
        await communityHardhatToken.hasRole(ADMIN_ROLE, owner.address)
      ).to.equal(true);
    });
  });

  describe("Withdrawal Token", () => {
    it("Should check admin can withdrwal token to our wallet in Private Sale Contract", async () => {
      const { hardhatToken, saleHardhatToken, privateSaleAmt } =
        await loadFixture(basicMethod);

      let amount = decimal(1000000);
      await saleHardhatToken.connect(deployer).withdrawalToken(amount);

      expect(await hardhatToken.balanceOf(deployer.address)).to.equal(amount);
      expect(await hardhatToken.balanceOf(saleHardhatToken.address)).to.equal(
        privateSaleAmt.sub(amount)
      );
    });

    it("Should check admin can withdrwal token to our wallet in Rewards Contract ", async () => {
      const { hardhatToken, rewardsHardhatToken, rewardsAmt } =
        await loadFixture(basicMethod);

      let amount = decimal(2000000);
      await rewardsHardhatToken.connect(deployer).withdrawalToken(amount);

      expect(await hardhatToken.balanceOf(deployer.address)).to.equal(amount);
      expect(
        await hardhatToken.balanceOf(rewardsHardhatToken.address)
      ).to.equal(rewardsAmt.sub(amount));
    });

    it("Should check admin can withdrwal token to our wallet in Team and Advisors Contract", async () => {
      const { hardhatToken, teamAdvisorsHardhatToken, teamAdvisorAmt } =
        await loadFixture(basicMethod);

      let amount = decimal(3000000);
      await teamAdvisorsHardhatToken.connect(deployer).withdrawalToken(amount);

      expect(await hardhatToken.balanceOf(deployer.address)).to.equal(amount);
      expect(
        await hardhatToken.balanceOf(teamAdvisorsHardhatToken.address)
      ).to.equal(teamAdvisorAmt.sub(amount));
    });

    it("Should check admin can withdrwal token to our wallet in Community Contract", async () => {
      const { hardhatToken, communityHardhatToken, communityAmt } =
        await loadFixture(basicMethod);

      let amount = decimal(4000000);
      await communityHardhatToken.connect(deployer).withdrawalToken(amount);

      expect(await hardhatToken.balanceOf(deployer.address)).to.equal(amount);
      expect(
        await hardhatToken.balanceOf(communityHardhatToken.address)
      ).to.equal(communityAmt.sub(amount));
    });
  });
});
