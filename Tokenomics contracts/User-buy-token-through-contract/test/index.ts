import { Provider } from "@ethersproject/abstract-provider";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Signer } from "ethers";
import { ethers } from "hardhat";
import { exit } from "process";

let day = 24 * 60 * 60;
let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

describe.only("Minter Test", () => {
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
    const supply = BigNumber.from("1000000000");
    const powValue = BigNumber.from("10").pow(18);
    const max_supply = await supply.mul(powValue);

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
    privateSaleAmt = await BigNumber.from("100000000").mul(powValue);
    await hardhatToken
      .connect(deployer)
      .addContracts(saleHardhatToken.address, privateSaleAmt);

    teamAdvisorAmt = await BigNumber.from("150000000").mul(powValue);
    await hardhatToken
      .connect(deployer)
      .addContracts(teamAdvisorsHardhatToken.address, teamAdvisorAmt);

    rewardsAmt = await BigNumber.from("300000000").mul(powValue);
    await hardhatToken
      .connect(deployer)
      .addContracts(rewardsHardhatToken.address, rewardsAmt);

    communityAmt = await BigNumber.from("450000000").mul(powValue);
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
      powValue,
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
        const { saleHardhatToken, powValue } = await loadFixture(basicMethod);

        let token1 = await saleHardhatToken.tokenamounts(1);
        let token2 = await saleHardhatToken.tokenamounts(2);
        let token3 = await saleHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(BigNumber.from("20000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("20000000").mul(powValue)),
          BigNumber.from(BigNumber.from("3333333").mul(powValue)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(BigNumber.from("5000000").mul(powValue)),
        ]);

        expect(token3).to.have.deep.members([
          BigNumber.from(BigNumber.from("50000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("50000000").mul(powValue)),
          BigNumber.from(BigNumber.from("50000000").mul(powValue)),
        ]);
      });

      it("Should check All Token Rate", async () => {
        const { saleHardhatToken, powValue } = await loadFixture(basicMethod);

        let rate1 = await saleHardhatToken.rates(1);
        let rate2 = await saleHardhatToken.rates(2);
        let rate3 = await saleHardhatToken.rates(3);
        expect(rate1).to.be.equal(BigNumber.from("15000000000000"));

        expect(rate2).to.be.equal(BigNumber.from("20000000000000"));

        expect(rate3).to.be.equal(BigNumber.from("30000000000000"));
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods ", async () => {
        const { saleHardhatToken, user2, user3, user4 } = await loadFixture(
          basicMethod
        );

        await expect(saleHardhatToken.connect(user2).saleStart(1)).to.be
          .reverted;

        await expect(saleHardhatToken.connect(user3).saleEnd(1)).to.be.reverted;

        await expect(saleHardhatToken.connect(user4).withdrawal()).to.be
          .reverted;
      });

      it("Should check Sale Start End not over ", async () => {
        const { saleHardhatToken, user2 } = await loadFixture(basicMethod);

        await expect(
          saleHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Sale not Start!");

        await saleHardhatToken.saleStart(1);
        await expect(saleHardhatToken.saleEnd(1)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken.saleEnd(1);
        await expect(
          saleHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Sale is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { saleHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        await saleHardhatToken.saleStart(1);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          saleHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Not enough Balance!");

        await expect(
          saleHardhatToken
            .connect(user3)
            .buyToken(1, BigNumber.from("3000000000000000001"), {
              value: ethers.utils.parseEther("10"),
            })
        ).to.be.reverted;
      });
    });

    describe("Buy Token in a single Month Methods", () => {
      it("Should check Private Sale 1 user buy tokens", async () => {
        const { saleHardhatToken, user2, user3, powValue } = await loadFixture(
          basicMethod
        );

        let saleId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await saleHardhatToken.saleStart(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await saleHardhatToken.connect(user2).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000015").mul(amount),
        });

        await saleHardhatToken.connect(user3).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000015").mul(amount),
        });

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await saleHardhatToken.userTokenBal(user3.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Private Sale 2 user buy tokens", async () => {
        const { saleHardhatToken, user2, user3, powValue } = await loadFixture(
          basicMethod
        );

        let saleId = 2;
        let cliffMonth = 9;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await saleHardhatToken.saleStart(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await saleHardhatToken.connect(user2).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000033").mul(amount),
        });

        await saleHardhatToken.connect(user3).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000033").mul(amount),
        });

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await saleHardhatToken.userTokenBal(user3.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Launch IDO user buy tokens", async () => {
        const { saleHardhatToken, user2, user3, powValue } = await loadFixture(
          basicMethod
        );

        let saleId = 3;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await saleHardhatToken.saleStart(saleId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await saleHardhatToken.connect(user2).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000050").mul(amount),
        });

        await saleHardhatToken.connect(user3).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000050").mul(amount),
        });

        expect(
          await saleHardhatToken.userTokenBal(user2.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
        expect(
          await saleHardhatToken.userTokenBal(user3.address, saleId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Contract Balance", async () => {
        const { saleHardhatToken, user2, user3, user4, user5, powValue } =
          await loadFixture(basicMethod);

        let saleId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        let increaseTime = clifdays + 3000;

        await saleHardhatToken.saleStart(saleId);

        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken.connect(user2).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000015").mul(amount),
        });

        await saleHardhatToken.connect(user3).buyToken(saleId, amount, {
          value: ethers.utils.parseEther("0.000015").mul(amount),
        });

        let cbal = ethers.utils.parseEther("0.000015").mul(2 * amount);
        expect(await saleHardhatToken.contractBal()).to.equal(cbal);
      });
    });

    describe("All over Testing Contract", () => {
      it("Should check Private Sale 1", async () => {
        // 0.000015 for 2000000
        const {
          hardhatToken,
          saleHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 0;
        let contractBal = await hardhatToken.balanceOf(
          saleHardhatToken.address
        );
        await saleHardhatToken.connect(deployer).saleStart(1);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // user1 buy token
        {
          let user1payAmt = ethers.utils.parseEther("0.000015").mul(350);
          await saleHardhatToken
            .connect(user1)
            .buyToken(1, 350, { value: user1payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(user1payAmt);
          let contractBalUser1 = await hardhatToken.balanceOf(
            saleHardhatToken.address
          );
          expect(contractBalUser1).to.equal(
            contractBal.sub(BigNumber.from(350).mul(powValue))
          );

          // user2 buy token

          let user2payAmt = ethers.utils.parseEther("0.000015").mul(1000);
          await saleHardhatToken
            .connect(user2)
            .buyToken(1, 1000, { value: user2payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt)
          );

          contractBalUser1 = await hardhatToken.balanceOf(
            saleHardhatToken.address
          );
          expect(contractBalUser1).to.equal(
            contractBal.sub(BigNumber.from(1350).mul(powValue))
          );

          // user3 buy token

          let user3payAmt = ethers.utils.parseEther("0.000015").mul(5000);
          await saleHardhatToken
            .connect(user3)
            .buyToken(1, 5000, { value: user3payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt).add(user3payAmt)
          );

          contractBalUser1 = await hardhatToken.balanceOf(
            saleHardhatToken.address
          );
          expect(contractBalUser1).to.equal(
            contractBal.sub(BigNumber.from(6350).mul(powValue))
          );
        }

        increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken.connect(deployer).saleEnd(1);

        let user4payAmt = ethers.utils.parseEther("0.000015").mul(650);

        await expect(
          saleHardhatToken
            .connect(user4)
            .buyToken(1, 650, { value: user4payAmt })
        ).to.be.revertedWith("Sale is Over!");
      });

      it("Should check Private Sale 2", async () => {
        // 0.000020 for 3000000
        const {
          hardhatToken,
          saleHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 9 * 31 + 1;
        let increaseTime = clifdays + 0;
        let contractBal = await hardhatToken.balanceOf(
          saleHardhatToken.address
        );
        await saleHardhatToken.connect(deployer).saleStart(2);

        await time.increaseTo(currentTime.add(increaseTime * day));
        {
          let user1payAmt = ethers.utils.parseEther("0.000020").mul(350);
          await saleHardhatToken
            .connect(user1)
            .buyToken(2, 350, { value: user1payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(user1payAmt);
          let contractBal1 = await hardhatToken.balanceOf(
            saleHardhatToken.address
          );
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(350).mul(powValue))
          );

          let user2payAmt = ethers.utils.parseEther("0.000020").mul(1000);
          await saleHardhatToken
            .connect(user2)
            .buyToken(2, 1000, { value: user2payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt)
          );

          contractBal1 = await hardhatToken.balanceOf(saleHardhatToken.address);
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(1350).mul(powValue))
          );

          let user3payAmt = ethers.utils.parseEther("0.000020").mul(5000);
          await saleHardhatToken
            .connect(user3)
            .buyToken(2, 5000, { value: user3payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt).add(user3payAmt)
          );

          contractBal1 = await hardhatToken.balanceOf(saleHardhatToken.address);
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(6350).mul(powValue))
          );
        }
        increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await saleHardhatToken.connect(deployer).saleEnd(2);

        let user4payAmt = ethers.utils.parseEther("0.000020").mul(650);

        await expect(
          saleHardhatToken
            .connect(user4)
            .buyToken(2, 650, { value: user4payAmt })
        ).to.be.revertedWith("Sale is Over!");
      });

      it("Should check Launchpad IDO", async () => {
        // 0.000030 for 5000000
        const {
          hardhatToken,
          saleHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);
        let contractBal = await hardhatToken.balanceOf(
          saleHardhatToken.address
        );
        await saleHardhatToken.connect(deployer).saleStart(3);

        {
          let user1payAmt = ethers.utils.parseEther("0.000030").mul(2000);
          await saleHardhatToken
            .connect(user1)
            .buyToken(3, 2000, { value: user1payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(user1payAmt);

          let contractBal1 = await hardhatToken.balanceOf(
            saleHardhatToken.address
          );
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(2000).mul(powValue))
          );

          let user2payAmt = ethers.utils.parseEther("0.000030").mul(5000);
          await saleHardhatToken
            .connect(user2)
            .buyToken(3, 5000, { value: user2payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt)
          );
          contractBal1 = await hardhatToken.balanceOf(saleHardhatToken.address);
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(7000).mul(powValue))
          );

          let user3payAmt = ethers.utils.parseEther("0.000030").mul(3000);
          await saleHardhatToken
            .connect(user3)
            .buyToken(3, 3000, { value: user3payAmt });

          expect(await saleHardhatToken.contractBal()).to.equal(
            user1payAmt.add(user2payAmt).add(user3payAmt)
          );
          contractBal1 = await hardhatToken.balanceOf(saleHardhatToken.address);
          expect(contractBal1).to.equal(
            contractBal.sub(BigNumber.from(10000).mul(powValue))
          );
        }

        await saleHardhatToken.connect(deployer).saleEnd(3);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(1400);

        await expect(
          saleHardhatToken
            .connect(user4)
            .buyToken(3, 1400, { value: user4payAmt })
        ).to.be.revertedWith("Sale is Over!");
      });
    });
  });

  describe("Protocol Rewards Contract", () => {
    describe("Add Rewards Token Type and Token Amounts", () => {
      it("Should check All Reward Token Type add", async () => {
        const { rewardsHardhatToken } = await loadFixture(basicMethod);

        let reward1 = await rewardsHardhatToken.rewards(1);
        let reward2 = await rewardsHardhatToken.rewards(2);
        let reward3 = await rewardsHardhatToken.rewards(3);
        expect(reward1).to.have.deep.members([
          "Staking rewards",
          BigNumber.from(0),
          BigNumber.from(60),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(reward2).to.have.deep.members([
          "Wallet airdrop rewards",
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(reward3).to.have.deep.members([
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
        const { rewardsHardhatToken, powValue } = await loadFixture(
          basicMethod
        );

        let token1 = await rewardsHardhatToken.tokenamounts(1);
        let token2 = await rewardsHardhatToken.tokenamounts(2);
        let token3 = await rewardsHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(BigNumber.from("240000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("240000000").mul(powValue)),
          BigNumber.from(BigNumber.from("4000000").mul(powValue)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
        ]);
        expect(token3).to.have.deep.members([
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
        ]);
      });

      it("Should check All Token Rate", async () => {
        const { rewardsHardhatToken } = await loadFixture(basicMethod);

        let rate1 = await rewardsHardhatToken.rates(1);
        let rate2 = await rewardsHardhatToken.rates(2);
        let rate3 = await rewardsHardhatToken.rates(3);
        expect(rate1).to.be.equal(BigNumber.from("30000000000000"));
        expect(rate2).to.be.equal(BigNumber.from("30000000000000"));
        expect(rate3).to.be.equal(BigNumber.from("30000000000000"));
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods", async () => {
        const { rewardsHardhatToken, user2, user3, user4 } = await loadFixture(
          basicMethod
        );

        await expect(rewardsHardhatToken.connect(user2).rewardStart(1)).to.be
          .reverted;

        await expect(rewardsHardhatToken.connect(user3).rewardEnd(1)).to.be
          .reverted;

        await expect(rewardsHardhatToken.connect(user4).withdrawal()).to.be
          .reverted;
      });

      it("Should check Distribute Token Start End not over ", async () => {
        const { rewardsHardhatToken, user2 } = await loadFixture(basicMethod);

        await expect(
          rewardsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Reward tokens not Start!");

        await rewardsHardhatToken.rewardStart(1);
        await expect(rewardsHardhatToken.rewardEnd(1)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1830;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.rewardEnd(1);
        await expect(
          rewardsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Reward tokens is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { rewardsHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        await rewardsHardhatToken.rewardStart(1);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          rewardsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Not enough Balance!");

        await expect(
          rewardsHardhatToken
            .connect(user3)
            .buyToken(1, BigNumber.from("3000000000000000001"), {
              value: ethers.utils.parseEther("10"),
            })
        ).to.be.reverted;
      });
    });

    describe("Buy Token Methods", () => {
      it("Should check Staking rewards user buy tokens", async () => {
        const { rewardsHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let rewardId = 1;
        let cliffMonth = 60;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await rewardsHardhatToken.rewardStart(rewardId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await rewardsHardhatToken.connect(user2).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000030").mul(amount),
        });

        await rewardsHardhatToken.connect(user3).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000030").mul(amount),
        });

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await rewardsHardhatToken.userTokenBal(user3.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Wallet airdrop rewards user buy tokens", async () => {
        const { rewardsHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let rewardId = 2;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await rewardsHardhatToken.rewardStart(rewardId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale2 user buy token
        await rewardsHardhatToken.connect(user2).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000033").mul(amount),
        });

        await rewardsHardhatToken.connect(user3).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000033").mul(amount),
        });

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await rewardsHardhatToken.userTokenBal(user3.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Marketplace airdrop rewards user buy tokens", async () => {
        const { rewardsHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let rewardId = 3;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await rewardsHardhatToken.rewardStart(rewardId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await rewardsHardhatToken.connect(user2).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000050").mul(amount),
        });

        await rewardsHardhatToken.connect(user3).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000050").mul(amount),
        });

        expect(
          await rewardsHardhatToken.userTokenBal(user2.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
        expect(
          await rewardsHardhatToken.userTokenBal(user3.address, rewardId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Contract Balance", async () => {
        const { rewardsHardhatToken, user2, user3, user4, user5, powValue } =
          await loadFixture(basicMethod);

        let rewardId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        let increaseTime = clifdays + 3000;

        await rewardsHardhatToken.rewardStart(rewardId);

        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.connect(user2).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000030").mul(amount),
        });

        await rewardsHardhatToken.connect(user3).buyToken(rewardId, amount, {
          value: ethers.utils.parseEther("0.000030").mul(amount),
        });

        let cbal = ethers.utils.parseEther("0.000030").mul(2 * amount);
        expect(await rewardsHardhatToken.contractBal()).to.equal(cbal);
      });
    });

    describe("All over Testing Contract", () => {
      it("Should check Staking rewards", async () => {
        // 0.000030 for 5000000
        const {
          hardhatToken,
          rewardsHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;

        let contractBal = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        await rewardsHardhatToken.connect(deployer).rewardStart(1);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // for user1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await rewardsHardhatToken
          .connect(user1)
          .buyToken(1, 350, { value: user1payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1650);
        await rewardsHardhatToken
          .connect(user2)
          .buyToken(1, 1650, { value: user2payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(2000).mul(powValue))
        );

        // for user3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(3000);
        await rewardsHardhatToken
          .connect(user3)
          .buyToken(1, 3000, { value: user3payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(5000).mul(powValue))
        );

        increaseTime = clifdays + 1825;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.connect(deployer).rewardEnd(1);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          rewardsHardhatToken
            .connect(user4)
            .buyToken(1, 350, { value: user4payAmt })
        ).to.be.revertedWith("Reward tokens is Over!");
      });

      it("Should check Wallet airdrop rewards", async () => {
        // 0.000015 for 2000000
        // 0.000020 for 3000000
        // 0.000030 for 5000000
        const {
          hardhatToken,
          rewardsHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;
        let contractBal = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        await rewardsHardhatToken.connect(deployer).rewardStart(2);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // for user1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await rewardsHardhatToken
          .connect(user1)
          .buyToken(2, 350, { value: user1payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1000);
        await rewardsHardhatToken
          .connect(user2)
          .buyToken(2, 1000, { value: user2payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(1350).mul(powValue))
        );

        // for user3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await rewardsHardhatToken
          .connect(user3)
          .buyToken(2, 5000, { value: user3payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.connect(deployer).rewardEnd(2);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          rewardsHardhatToken
            .connect(user4)
            .buyToken(2, 350, { value: user4payAmt })
        ).to.be.revertedWith("Reward tokens is Over!");
      });

      it("Should check Marketplace airdrop rewards", async () => {
        // 0.000015 for 2000000
        // 0.000020 for 3000000
        // 0.000030 for 5000000
        const {
          hardhatToken,
          rewardsHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;

        await rewardsHardhatToken.connect(deployer).rewardStart(3);
        let contractBal = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );

        await time.increaseTo(currentTime.add(increaseTime * day));
        // for user1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(700);
        await rewardsHardhatToken
          .connect(user1)
          .buyToken(3, 700, { value: user1payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(700).mul(powValue))
        );

        // for user2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1300);
        await rewardsHardhatToken
          .connect(user2)
          .buyToken(3, 1300, { value: user2payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );

        let contractBalUser2 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(2000).mul(powValue))
        );

        // for user3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await rewardsHardhatToken
          .connect(user3)
          .buyToken(3, 5000, { value: user3payAmt });

        expect(await rewardsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          rewardsHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(7000).mul(powValue))
        );

        increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await rewardsHardhatToken.connect(deployer).rewardEnd(3);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          rewardsHardhatToken
            .connect(user4)
            .buyToken(3, 350, { value: user4payAmt })
        ).to.be.revertedWith("Reward tokens is Over!");
      });
    });
  });

  describe("Team and Advisors Contract", () => {
    describe("Add Distribute Token Type and Token Amounts", () => {
      it("Should check All Distribute Token Type add", async () => {
        const { teamAdvisorsHardhatToken } = await loadFixture(basicMethod);

        let distrToken1 = await teamAdvisorsHardhatToken.teamadvisors(1);
        let distr2 = await teamAdvisorsHardhatToken.teamadvisors(2);
        expect(distrToken1).to.have.deep.members([
          "Team",
          BigNumber.from(12),
          BigNumber.from(12),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(distr2).to.have.deep.members([
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
        const { teamAdvisorsHardhatToken, powValue } = await loadFixture(
          basicMethod
        );

        let token1 = await teamAdvisorsHardhatToken.tokenamounts(1);
        let token2 = await teamAdvisorsHardhatToken.tokenamounts(2);
        expect(token1).to.have.deep.members([
          BigNumber.from(BigNumber.from("120000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("120000000").mul(powValue)),
          BigNumber.from(BigNumber.from("10000000").mul(powValue)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("30000000").mul(powValue)),
          BigNumber.from(BigNumber.from("2500000").mul(powValue)),
        ]);
      });

      it("Should check All Token Rate", async () => {
        const { teamAdvisorsHardhatToken } = await loadFixture(basicMethod);

        let rate1 = await teamAdvisorsHardhatToken.rates(1);
        let rate2 = await teamAdvisorsHardhatToken.rates(2);
        expect(rate1).to.be.equal(BigNumber.from("30000000000000"));

        expect(rate2).to.be.equal(BigNumber.from("30000000000000"));
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods ", async () => {
        const { teamAdvisorsHardhatToken, user2, user3, user4 } =
          await loadFixture(basicMethod);

        await expect(teamAdvisorsHardhatToken.connect(user2).distrStart(1)).to
          .be.reverted;

        await expect(teamAdvisorsHardhatToken.connect(user3).distrEnd(1)).to.be
          .reverted;

        await expect(teamAdvisorsHardhatToken.connect(user4).withdrawal()).to.be
          .reverted;
      });

      it("Should check Distribute Token Start End not over ", async () => {
        const { teamAdvisorsHardhatToken, user2 } = await loadFixture(
          basicMethod
        );

        await expect(
          teamAdvisorsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Distribute token not Start!");

        await teamAdvisorsHardhatToken.distrStart(1);
        await expect(teamAdvisorsHardhatToken.distrEnd(1)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken.distrEnd(1);
        await expect(
          teamAdvisorsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Distribute token is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { teamAdvisorsHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        await teamAdvisorsHardhatToken.distrStart(1);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 180;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          teamAdvisorsHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Not enough Balance!");

        await expect(
          teamAdvisorsHardhatToken
            .connect(user3)
            .buyToken(1, BigNumber.from("3000000000000000001"), {
              value: ethers.utils.parseEther("10"),
            })
        ).to.be.reverted;
      });
    });

    describe("Buy Token Methods", () => {
      it("Should check Team user buy tokens", async () => {
        const { teamAdvisorsHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let distrTokenId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 50;
        await teamAdvisorsHardhatToken.distrStart(distrTokenId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await teamAdvisorsHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        await teamAdvisorsHardhatToken
          .connect(user3)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(
            user2.address,
            distrTokenId
          )
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(
            user3.address,
            distrTokenId
          )
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Advisors user buy tokens", async () => {
        const { teamAdvisorsHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let distrTokenId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 150;
        await teamAdvisorsHardhatToken.distrStart(distrTokenId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // sale1 user buy token
        await teamAdvisorsHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        await teamAdvisorsHardhatToken
          .connect(user3)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(
            user2.address,
            distrTokenId
          )
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await teamAdvisorsHardhatToken.userTokenBal(
            user3.address,
            distrTokenId
          )
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Contract Balance", async () => {
        const {
          teamAdvisorsHardhatToken,
          user2,

          user5,
          powValue,
        } = await loadFixture(basicMethod);

        let distrTokenId = 1;
        let cliffMonth = 12;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;

        await teamAdvisorsHardhatToken.distrStart(distrTokenId);
        await teamAdvisorsHardhatToken.distrStart(2);
        let increaseTime = clifdays + 3000;

        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("1"),
          });

        await teamAdvisorsHardhatToken.connect(user5).buyToken(1, amount, {
          value: ethers.utils.parseEther("1"),
        });

        await teamAdvisorsHardhatToken.connect(user5).buyToken(2, amount, {
          value: ethers.utils.parseEther("1"),
        });

        let cbal = BigNumber.from((amount / 100) * 3);
        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          BigNumber.from(cbal).mul(powValue)
        );
      });
    });

    describe("All over Testing Contract", () => {
      it("Should check Team", async () => {
        // 0.000030 for 5000000
        const {
          hardhatToken,
          teamAdvisorsHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 0;

        let contractBal = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );

        await teamAdvisorsHardhatToken.connect(deployer).distrStart(1);

        await time.increaseTo(currentTime.add(increaseTime * day));

        //for user1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await teamAdvisorsHardhatToken
          .connect(user1)
          .buyToken(1, 350, { value: user1payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt
        );
        let contractBalUser1 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1000);
        await teamAdvisorsHardhatToken
          .connect(user2)
          .buyToken(1, 1000, { value: user2payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(1350).mul(powValue))
        );

        // for user3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await teamAdvisorsHardhatToken
          .connect(user3)
          .buyToken(1, 5000, { value: user3payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken.connect(deployer).distrEnd(1);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          teamAdvisorsHardhatToken
            .connect(user4)
            .buyToken(1, 6350, { value: user4payAmt })
        ).to.be.revertedWith("Distribute token is Over!");
      });

      it("Should check Advisors", async () => {
        // 0.000030 for 5000000
        const {
          hardhatToken,
          teamAdvisorsHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 12 * 31 + 1;
        let increaseTime = clifdays + 0;

        let contractBal = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );

        await teamAdvisorsHardhatToken.connect(deployer).distrStart(2);

        await time.increaseTo(currentTime.add(increaseTime * day));

        //for user1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await teamAdvisorsHardhatToken
          .connect(user1)
          .buyToken(2, 350, { value: user1payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt
        );
        let contractBalUser1 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );
        // for user2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(2000);
        await teamAdvisorsHardhatToken
          .connect(user2)
          .buyToken(2, 2000, { value: user2payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(2350).mul(powValue))
        );

        // for user3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(4000);
        await teamAdvisorsHardhatToken
          .connect(user3)
          .buyToken(2, 4000, { value: user3payAmt });

        expect(await teamAdvisorsHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          teamAdvisorsHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await teamAdvisorsHardhatToken.connect(deployer).distrEnd(2);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          teamAdvisorsHardhatToken
            .connect(user4)
            .buyToken(2, 6350, { value: user4payAmt })
        ).to.be.revertedWith("Distribute token is Over!");
      });
    });
  });

  describe("Community Treasury, Liquidity, Partners Contract", () => {
    describe("Add Rewards Token Type and Token Amounts", () => {
      it("Should check All Reward Token Type add", async () => {
        const { communityHardhatToken } = await loadFixture(basicMethod);

        let commu1 = await communityHardhatToken.communities(1);
        let commu2 = await communityHardhatToken.communities(2);
        let commu3 = await communityHardhatToken.communities(3);
        expect(commu1).to.have.deep.members([
          "Community Treasury",
          BigNumber.from(0),
          BigNumber.from(48),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(commu2).to.have.deep.members([
          "Liquidity",
          BigNumber.from(0),
          BigNumber.from(4),
          BigNumber.from(0),
          BigNumber.from(0),
          false,
          true,
        ]);

        expect(commu3).to.have.deep.members([
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
        const { communityHardhatToken, powValue } = await loadFixture(
          basicMethod
        );

        let token1 = await communityHardhatToken.tokenamounts(1);
        let token2 = await communityHardhatToken.tokenamounts(2);
        let token3 = await communityHardhatToken.tokenamounts(3);
        expect(token1).to.have.deep.members([
          BigNumber.from(BigNumber.from("250000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("250000000").mul(powValue)),
          BigNumber.from(BigNumber.from("5208333").mul(powValue)),
        ]);

        expect(token2).to.have.deep.members([
          BigNumber.from(BigNumber.from("100000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("100000000").mul(powValue)),
          BigNumber.from(BigNumber.from("25000000").mul(powValue)),
        ]);
        expect(token3).to.have.deep.members([
          BigNumber.from(BigNumber.from("100000000").mul(powValue)),
          BigNumber.from(0),
          BigNumber.from(BigNumber.from("100000000").mul(powValue)),
          BigNumber.from(BigNumber.from("6666666").mul(powValue)),
        ]);
      });

      it("Should check All Token Rate", async () => {
        const { communityHardhatToken } = await loadFixture(basicMethod);

        let rate1 = await communityHardhatToken.rates(1);
        let rate2 = await communityHardhatToken.rates(2);
        let rate3 = await communityHardhatToken.rates(3);
        expect(rate1).to.be.equal(BigNumber.from("30000000000000"));
        expect(rate2).to.be.equal(BigNumber.from("30000000000000"));
        expect(rate3).to.be.equal(BigNumber.from("30000000000000"));
      });
    });

    describe("Reverts Methods", () => {
      it("Should check Only Owner Access methods ", async () => {
        const { communityHardhatToken, user2, user3, user4 } =
          await loadFixture(basicMethod);

        await expect(communityHardhatToken.connect(user2).distrStart(1)).to.be
          .reverted;

        await expect(communityHardhatToken.connect(user3).distrEnd(1)).to.be
          .reverted;

        await expect(communityHardhatToken.connect(user4).withdrawal()).to.be
          .reverted;
      });

      it("Should check Distribute Token Start End not over ", async () => {
        const { communityHardhatToken, user2 } = await loadFixture(basicMethod);

        await expect(
          communityHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Distribution tokens not Start!");

        await communityHardhatToken.distrStart(1);
        await expect(communityHardhatToken.distrEnd(1)).to.be.revertedWith(
          "Cliff/Vested not Over!"
        );

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 1830;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken.distrEnd(1);
        await expect(
          communityHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Distribution tokens is Over!");
      });

      it("Should check Buy Token reverts ", async () => {
        const { communityHardhatToken, user2, user3 } = await loadFixture(
          basicMethod
        );

        await communityHardhatToken.distrStart(1);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await expect(
          communityHardhatToken.connect(user2).buyToken(1, 100)
        ).to.be.revertedWith("Not enough Balance!");

        await expect(
          communityHardhatToken
            .connect(user3)
            .buyToken(1, BigNumber.from("3000000000000000001"), {
              value: ethers.utils.parseEther("10"),
            })
        ).to.be.reverted;
      });
    });

    describe("Buy Token Methods", () => {
      it("Should check Community Treasury users can Buy Token", async () => {
        const { communityHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let distrTokenId = 1;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await communityHardhatToken.distrStart(distrTokenId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // user1 buy token
        await communityHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        // user1 buy token
        await communityHardhatToken
          .connect(user3)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await communityHardhatToken.userTokenBal(user3.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Liquidity users can Buy Token", async () => {
        const { communityHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let distrTokenId = 2;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await communityHardhatToken.distrStart(distrTokenId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // user1 buy token
        await communityHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        // user1 buy token
        await communityHardhatToken
          .connect(user3)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await communityHardhatToken.userTokenBal(user3.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Partners users can Buy Token", async () => {
        const { communityHardhatToken, user2, user3, powValue } =
          await loadFixture(basicMethod);

        let distrTokenId = 3;
        let cliffMonth = 6;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;
        await communityHardhatToken.distrStart(distrTokenId);

        let increaseTime = clifdays + 30;
        await time.increaseTo(currentTime.add(increaseTime * day));

        // user1 buy token
        await communityHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        // user1 buy token
        await communityHardhatToken
          .connect(user3)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("0.000030").mul(amount),
          });

        expect(
          await communityHardhatToken.userTokenBal(user2.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));

        expect(
          await communityHardhatToken.userTokenBal(user3.address, distrTokenId)
        ).to.equal(BigNumber.from(amount).mul(powValue));
      });

      it("Should check Contract Balance", async () => {
        const {
          communityHardhatToken,
          user2,

          user5,
          powValue,
        } = await loadFixture(basicMethod);

        let distrTokenId = 1;
        let cliffMonth = 0;
        let clifdays = cliffMonth * 31 + 1;
        let amount = 100;

        await communityHardhatToken.distrStart(distrTokenId);
        await communityHardhatToken.distrStart(2);
        let increaseTime = clifdays + 3000;

        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken
          .connect(user2)
          .buyToken(distrTokenId, amount, {
            value: ethers.utils.parseEther("1"),
          });

        await communityHardhatToken.connect(user5).buyToken(1, amount, {
          value: ethers.utils.parseEther("1"),
        });

        await communityHardhatToken.connect(user5).buyToken(2, amount, {
          value: ethers.utils.parseEther("1"),
        });

        let cbal = BigNumber.from((amount / 100) * 3);
        expect(await communityHardhatToken.contractBal()).to.equal(
          BigNumber.from(cbal).mul(powValue)
        );
      });
    });

    describe("All over Testing Contract", () => {
      it("Should check Community Treasury", async () => {
        // 0.000030 for 5000000
        const {
          hardhatToken,
          communityHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;

        let contractBal = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        await communityHardhatToken.connect(deployer).distrStart(1);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // for user 1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await communityHardhatToken
          .connect(user1)
          .buyToken(1, 350, { value: user1payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user 2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1000);
        await communityHardhatToken
          .connect(user2)
          .buyToken(1, 1000, { value: user2payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(1350).mul(powValue))
        );

        // for user 3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await communityHardhatToken
          .connect(user3)
          .buyToken(1, 5000, { value: user3payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 1460;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken.connect(deployer).distrEnd(1);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          communityHardhatToken
            .connect(user4)
            .buyToken(1, 350, { value: user4payAmt })
        ).to.be.revertedWith("Distribution tokens is Over!");
      });

      it("Should check Liquidity", async () => {
        // 0.000015 for 2000000
        // 0.000020 for 3000000
        // 0.000030 for 5000000
        const {
          hardhatToken,
          communityHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 0 * 31 + 1;
        let increaseTime = clifdays + 0;
        let contractBal = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        await communityHardhatToken.connect(deployer).distrStart(2);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // for user 1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await communityHardhatToken
          .connect(user1)
          .buyToken(2, 350, { value: user1payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user 2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1000);
        await communityHardhatToken
          .connect(user2)
          .buyToken(2, 1000, { value: user2payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(1350).mul(powValue))
        );

        // for user 3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await communityHardhatToken
          .connect(user3)
          .buyToken(2, 5000, { value: user3payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 366;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken.connect(deployer).distrEnd(2);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          communityHardhatToken
            .connect(user4)
            .buyToken(2, 350, { value: user4payAmt })
        ).to.be.revertedWith("Distribution tokens is Over!");
      });

      it("Should check Partners", async () => {
        // 0.000015 for 2000000
        // 0.000020 for 3000000
        // 0.000030 for 5000000
        const {
          hardhatToken,
          communityHardhatToken,
          user1,
          user2,
          user3,
          user4,
          powValue,
        } = await loadFixture(basicMethod);

        let clifdays = 6 * 31 + 1;
        let increaseTime = clifdays + 0;

        let contractBal = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );

        await communityHardhatToken.connect(deployer).distrStart(3);

        await time.increaseTo(currentTime.add(increaseTime * day));

        // for user 1
        let user1payAmt = ethers.utils.parseEther("0.000030").mul(350);
        await communityHardhatToken
          .connect(user1)
          .buyToken(3, 350, { value: user1payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(user1payAmt);
        let contractBalUser1 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser1).to.equal(
          contractBal.sub(BigNumber.from(350).mul(powValue))
        );

        // for user 2
        let user2payAmt = ethers.utils.parseEther("0.000030").mul(1000);
        await communityHardhatToken
          .connect(user2)
          .buyToken(3, 1000, { value: user2payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt)
        );
        let contractBalUser2 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser2).to.equal(
          contractBal.sub(BigNumber.from(1350).mul(powValue))
        );

        // for user 3
        let user3payAmt = ethers.utils.parseEther("0.000030").mul(5000);
        await communityHardhatToken
          .connect(user3)
          .buyToken(3, 5000, { value: user3payAmt });

        expect(await communityHardhatToken.contractBal()).to.equal(
          user1payAmt.add(user2payAmt).add(user3payAmt)
        );
        let contractBalUser3 = await hardhatToken.balanceOf(
          communityHardhatToken.address
        );
        expect(contractBalUser3).to.equal(
          contractBal.sub(BigNumber.from(6350).mul(powValue))
        );

        increaseTime = clifdays + 639;
        await time.increaseTo(currentTime.add(increaseTime * day));
        await communityHardhatToken.connect(deployer).distrEnd(3);

        let user4payAmt = ethers.utils.parseEther("0.000030").mul(650);

        await expect(
          communityHardhatToken
            .connect(user4)
            .buyToken(3, 350, { value: user4payAmt })
        ).to.be.revertedWith("Distribution tokens is Over!");
      });
    });
  });
});
