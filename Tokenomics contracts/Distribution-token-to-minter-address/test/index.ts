import { Provider } from "@ethersproject/abstract-provider";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Signer } from "ethers";
import { ethers } from "hardhat";
import { exit } from "process";
import { PromiseOrValue } from "../typechain-types/common";

let day = 24 * 60 * 60;
let currentTime = BigNumber.from(Math.floor(new Date().getTime() / 1000));

describe.only("Token and VToken Contract", () => {
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let user: PromiseOrValue<string>[];
  let user1: SignerWithAddress;
  let userConnect: (string | Signer | Provider)[];
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
  let amountOfToken;

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

    const supply = BigNumber.from("1000000000");
    const powValue = BigNumber.from("10").pow(18);
    const max_supply = await supply.mul(powValue);
    const mint = await BigNumber.from("100").mul(powValue);
    const mint2 = await BigNumber.from("200").mul(powValue);

    // Deploy Token Contract
    const Tokens = await ethers.getContractFactory("BLC_Token");
    const hardhatToken = await Tokens.deploy(owner.address);

    //tokenomics contract constructor parameters
    user = [
      user1.address,
      user2.address,
      user3.address,
      user4.address,
      user5.address,
      user6.address,
      user7.address,
      user8.address,
      user9.address,
      user10.address,
      user11.address,
    ];

    let clifMonth = [12, 9, 0, 12, 12, 0, 0, 0, 0, 0, 6];
    let percentage = [2, 3, 5, 12, 3, 24, 3, 3, 25, 10, 10];
    let vestedMonth = [6, 6, 0, 12, 12, 60, 0, 0, 48, 4, 15];
    const token_ = hardhatToken.address;
    const dao = owner.address;

    amountOfToken = [percentage[0]];

    // calculate percentage of token transfer by Minters
    let percentageAmount = [];
    for (let i = 0; i < 11; i++) {
      percentageAmount[i] = max_supply
        .mul(BigNumber.from(percentage[i]))
        .div(100);
    }
    amountOfToken = percentageAmount;

    //deploy Tokenomics Contract
    const tokenomicsTokens = await ethers.getContractFactory("BLC_Tokenomics");
    const tokenomicsHardhatToken = await tokenomicsTokens.deploy(
      token_,
      dao,
      user,
      clifMonth,
      amountOfToken,
      vestedMonth
    );

    await hardhatToken.updateContract(tokenomicsHardhatToken.address);

    userConnect = [
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
    ];

    return {
      deployer,
      owner,
      user1,
      user2,
      user3,
      user,
      userConnect,
      mint,
      mint2,
      max_supply,
      powValue,
      hardhatToken,
      tokenomicsHardhatToken,
      dao,
      clifMonth,
      amountOfToken,
      vestedMonth,
    };
  }

  /*  
    Check Tokeno Testing
  */
  describe("Development For Token", () => {
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
      const { deployer, hardhatToken, mint } = await loadFixture(basicMethod);
      expect(await hardhatToken.totalSupply()).to.be.equal(BigNumber.from(0));
    });

    it("Should check token Max_supply", async () => {
      const { hardhatToken, max_supply } = await loadFixture(basicMethod);
      expect(await hardhatToken.max_supply()).to.be.equal(
        BigNumber.from(max_supply)
      );
    });

    it("Should check token BalanceOf", async () => {
      const { deployer, hardhatToken, mint } = await loadFixture(basicMethod);
      expect(await hardhatToken.balanceOf(deployer.address)).to.be.equal(
        BigNumber.from(0)
      );
    });

    it("Should check token Transfer: Deployer to user1", async () => {
      const { deployer, user1, hardhatToken, mint } = await loadFixture(
        basicMethod
      );
      await hardhatToken.transfer(user1.address, BigNumber.from("0"));
      expect(await hardhatToken.balanceOf(deployer.address)).to.be.equal(
        BigNumber.from(0)
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

  /*  
    Check Tokenomics Testing
  */
  describe("Development For Tokenomics", () => {
    /*
      Check all Minters added or not
    */
    describe("Should check all 11 Minters added", () => {
      it("Should check Add all 11 Minters", async () => {
        const {
          tokenomicsHardhatToken,
          clifMonth,
          amountOfToken,
          vestedMonth,
        } = await loadFixture(basicMethod);
        for (let i = 0; i < vestedMonth.length; i++) {
          let mm = await tokenomicsHardhatToken.minters(user[i]);
          // console.log("User Detail->>>>>>", mm);
          expect(mm).to.have.deep.members([
            user[i],
            BigNumber.from(clifMonth[i]),
            BigNumber.from(amountOfToken[i]),
            BigNumber.from(vestedMonth[i]),
          ]);
        }
      });
    });

    /*
      Check Event calling in transferAndSend method
    */
    describe.skip("Events Check", function () {
      it.skip("Should emit an event on transferAndSend", async () => {
        const { tokenomicsHardhatToken } = await loadFixture(basicMethod);
        // let emitMetohd = await tokenomicsHardhatToken
        //   .connect(user1)
        //   .transferAndSend(10000);

        // expect(emitMetohd)
        //   .to.emit(tokenomicsHardhatToken, "Withdrawal")
        //   .withArgs(user1.address, BigNumber.from(10000));
      });
    });

    describe("Reverts Check", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { tokenomicsHardhatToken } = await loadFixture(basicMethod);
        await expect(
          tokenomicsHardhatToken.connect(user1).claim()
        ).to.be.revertedWith("Cliff not expired");
      });

      it("Should revert with the right error this is not minter", async function () {
        const { tokenomicsHardhatToken } = await loadFixture(basicMethod);
        await expect(
          tokenomicsHardhatToken.connect(owner).claim()
        ).to.be.revertedWith("Vested Token:ONLY_MINTER");
      });
    });

    describe("Loop Token Balances", () => {
      for (let i = 0; i < 11; i++) {
        it(`Should check Claim balance for Minter${i + 1}`, async () => {
          const {
            hardhatToken,
            tokenomicsHardhatToken,
            clifMonth,
            vestedMonth,
          } = await loadFixture(basicMethod);

          let clifdays = clifMonth[i] == 0 ? 1 : clifMonth[i] * 31;
          if (vestedMonth[i] > 0) {
            for (let j = 0; j <= vestedMonth[i]; j++) {
              let valu = clifdays + 30 * j;

              await time.increaseTo(currentTime.add(valu * day));
              await tokenomicsHardhatToken.connect(userConnect[i]).claim();
            }
          } else {
            await tokenomicsHardhatToken.connect(userConnect[i]).claim();
          }
          let minters = await tokenomicsHardhatToken.minters(user[i]);
          let userBal = await tokenomicsHardhatToken._claimOf(user[i]);
          // console.log("userBal->>>>", userBal);

          expect(minters.amount).to.equal(BigNumber.from(userBal));
          let mintersToken = await hardhatToken.balanceOf(user[i]);
          expect(mintersToken).to.equal(BigNumber.from(userBal));
        });
      }
    });

    describe("Check If mint skip the month", () => {
      it(`Should check minter can skipping 2 or 3 month but amount send calculating skipping months`, async () => {
        const { tokenomicsHardhatToken, clifMonth } = await loadFixture(
          basicMethod
        );
        let i = 0;
        let clifdays = clifMonth[i] == 0 ? 1 : clifMonth[i] * 30;

        let valu = clifdays + 190;
        await time.increaseTo(currentTime.add(valu * day));
        await tokenomicsHardhatToken.connect(userConnect[i]).claim();
        // console.log(
        //   "_claimOf->>",
        //   await tokenomicsHardhatToken._claimOf(user[i])
        // );
        // console.log(
        //   "top remaining token->>",
        //   await tokenomicsHardhatToken.remainingToken(user[i])
        // );

        valu = clifdays + 210;
        await time.increaseTo(currentTime.add(valu * day));
        await tokenomicsHardhatToken.connect(userConnect[i]).claim();
        // console.log(
        //   "_claimOf->>",
        //   await tokenomicsHardhatToken._claimOf(user[i])
        // );
        // console.log(
        //   "------------------------------------------------------------------------------------"
        // );
      });
    });
  });
});
