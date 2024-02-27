import { expect } from "chai";
import {  Contract, constants } from "ethers";
import hre, { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";



describe("DAPP", function () {
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;
  let token: Contract;
  let topup: Contract;

  before(async () => {
    [signer, user1] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("TopupToken", signer);
    const dappFactory = await ethers.getContractFactory("Dapp", signer);

    token = await tokenFactory.deploy();
    topup = await dappFactory.deploy(token.address);

    hre.tracer.nameTags[user1.address] = "userOne";
    hre.tracer.nameTags[signer.address] = "singer";
    hre.tracer.nameTags[token.address] = "TopupToken-Contract";
    hre.tracer.nameTags[topup.address] = "Topup-Contract";
  });

  describe("Topup Contract", () => {
    it("Mint Topup tokens", async () => {
      await expect(
        token.mint(user1.address, parseEther("100"))
      ).to.changeTokenBalance(token, user1.address, parseEther("100"));
    });

    it("Throw, if topup tokens are not approved for dapp contract", async () => {
      await expect(
        topup.connect(user1).topup(parseEther("10"))
      ).to.revertedWith("ERC20: insufficient allowance");
    });

    it("Approve Topup Token to the Dapp contract", async () => {
      await expect(
        token.connect(user1).approve(topup.address, constants.MaxUint256)
      )
        .emit(token, "Approval")
        .withArgs(user1.address, topup.address, constants.MaxUint256);
    });

    it("Deposit Token", async () => {
      await expect(
        topup.connect(user1).topup(parseEther("10"))
      ).to.changeTokenBalance(token, topup.address, parseEther("10"));

      expect(await topup.callStatic.balances(user1.address)).to.be.equal(
        parseEther("10")
      );
    });

    it("Throw, if deposit amount is zero", async () => {
      await expect(
        topup.connect(user1).topup(parseEther("0"))
      ).to.be.revertedWithCustomError(topup, "ZeroAmount");
    });

    it("Throw, if deposit amount is greater than current balance", async () => {
      await expect(
        topup.connect(user1).topup(parseEther("100"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Throw, if deposit amount is greater than current balance", async () => {
      await expect(
        topup.connect(user1).topup(parseEther("100"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Withdraw topup tokens from the dapp", async () => {
      await expect(
        topup.connect(user1).withdraw(parseEther("5"))
      ).to.changeTokenBalance(token, user1.address, parseEther("5"));
      expect(await token.callStatic.balanceOf(user1.address)).to.be.equal(parseEther("95"));
    });

    it("Throw, if user try to withdraw amount greater than deposited amount", async () => {
      await expect(
        topup.connect(user1).withdraw(parseEther("10"))
      ).to.revertedWithCustomError(topup,"IsufficientBalance")
    });

    it("Throw, if user try to withdraw amount greater than deposited amount", async () => {
      await expect(
        topup.connect(user1).withdraw(parseEther("10"))
      ).to.revertedWithCustomError(topup,"IsufficientBalance")
    });


  });
});
