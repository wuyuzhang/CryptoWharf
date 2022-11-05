// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Fundraise = await hre.ethers.getContractFactory("Fundraise");
  // https://docs.tellor.io/tellor/the-basics/contracts-reference
  const fundraise = await Fundraise.deploy("0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2");

  await fundraise.deployed();

  console.log(
    `Deployed to ${fundraise.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
