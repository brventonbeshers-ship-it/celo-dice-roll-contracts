const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiceRollV2", function () {
  let diceRoll;
  let owner;
  let player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();
    const DiceRollV2 = await ethers.getContractFactory("DiceRollV2");
    diceRoll = await DiceRollV2.deploy();
  });

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      expect(await diceRoll.owner()).to.equal(owner.address);
    });

    it("should start with zero total rolls", async function () {
      expect(await diceRoll.totalRolls()).to.equal(0);
    });

    it("should start with zero total wins", async function () {
      expect(await diceRoll.totalWins()).to.equal(0);
    });

    it("should start with game active", async function () {
      expect(await diceRoll.isGameActive()).to.be.true;
    });
  });

  describe("Rolling", function () {
    it("should reject guess below 1", async function () {
      await expect(diceRoll.connect(player).rollDice(0))
        .to.be.revertedWith("Invalid guess");
    });

    it("should reject guess above 6", async function () {
      await expect(diceRoll.connect(player).rollDice(7))
        .to.be.revertedWith("Invalid guess");
    });

    it("should accept valid guess and update stats", async function () {
      await diceRoll.connect(player).rollDice(3);
      const stats = await diceRoll.getUserStats(player.address);
      expect(stats.rolls).to.equal(1);
    });

    it("should increment total rolls", async function () {
      await diceRoll.connect(player).rollDice(1);
      await diceRoll.connect(player).rollDice(4);
      expect(await diceRoll.totalRolls()).to.equal(2);
    });

    it("should emit DiceRolled event", async function () {
      await expect(diceRoll.connect(player).rollDice(3))
        .to.emit(diceRoll, "DiceRolled");
    });
  });

  describe("Admin", function () {
    it("should allow owner to pause", async function () {
      await diceRoll.setGamePaused(true);
      expect(await diceRoll.isGameActive()).to.be.false;
    });

    it("should reject non-owner pause", async function () {
      await expect(diceRoll.connect(player).setGamePaused(true))
        .to.be.revertedWith("Not authorized");
    });

    it("should reject roll when paused", async function () {
      await diceRoll.setGamePaused(true);
      await expect(diceRoll.connect(player).rollDice(3))
        .to.be.revertedWith("Game is paused");
    });
  });
});
