const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DiceRollV2...");

  const DiceRollV2 = await ethers.getContractFactory("DiceRollV2");
  const diceRoll = await DiceRollV2.deploy();

  await diceRoll.waitForDeployment();
  const address = await diceRoll.getAddress();

  console.log("DiceRollV2 deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
