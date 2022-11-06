const { expect } = require('chai');
const { ethers, network } = require("hardhat");


describe('Fundraise contract', () => {
  before(async function () {
    //We are forking Polygon mainnet, please set Alchemy key in .env
    await network.provider.request({
      method: "hardhat_reset",
      params: [{
        forking: {
          enabled: true,
          jsonRpcUrl: "https://polygon-mumbai.g.alchemyapi.io/v2/u_FXALLy4x1YgU3d25d6jSmEvX2pgdcc",
          //you can fork from last block by commenting next line
        },
      },],
    });
  });

  it("Test create and read plan", async function () {
    // Deploy Fundraise contract
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0x71402a46d78a10c8eE7E7CdEf2AffeC8d1E312A1", "0xEB796bdb90fFA0f28255275e16936D25d3418603");
    expect(await fundraiseContract._owner()).to.equal(owner.address);

    // Test create and view plan
    await fundraiseContract.connect(owner).createPlan(
      "test_plan_id",
      "test_project_id",
      "test_project_name",
      addr1.address,
      100,
      10,
      999999
    );
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[0]).to.equal(100);
    expect(expected[1]).to.equal(10);
    expect(expected[2]).to.equal(999999);
    expect(expected[3]).to.equal(0);
    expect(expected[4]).to.equal(0);
  });

  it("Test deposit, invest, unlock plan and withdraw", async function () {
    const [owner, founder, investor1, investor2] = await ethers.getSigners();
    let usdcWhale = await ethers.getImpersonatedSigner("0x71632b0e6b5347bac09e85a40b329397af473933");

    // Deploy Token contract and transfer funds to investor accounts
    const tokenContract = await ethers.getContractAt("Token", "0xe097d6b3100777dc31b34dc2c58fb524c2e76921"); // USDC
    await tokenContract.connect(usdcWhale).transfer(investor1.address, 77770000);
    await tokenContract.connect(usdcWhale).transfer(investor2.address, 77760000);

    // Deploy Fundraise contract and initialize base token contract as above Token contract
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0x71402a46d78a10c8eE7E7CdEf2AffeC8d1E312A1", "0xEB796bdb90fFA0f28255275e16936D25d3418603");
    expect(await fundraiseContract._owner()).to.equal(owner.address);
    await fundraiseContract.connect(owner).updateBaseTokenContract(tokenContract.address);

    // Investors set allowance for fundraise contract to transfer funds
    await tokenContract.connect(investor1).increaseAllowance(fundraiseContract.address, 77770000);
    expect(await tokenContract.allowance(investor1.address, fundraiseContract.address)).to.equal(77770000);
    await tokenContract.connect(investor2).increaseAllowance(fundraiseContract.address, 77760000);
    expect(await tokenContract.allowance(investor2.address, fundraiseContract.address)).to.equal(77760000);

    // Investor deposit token into fundraise contract
    await fundraiseContract.connect(investor1).depositTokens(77770000);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(77770000);
    await fundraiseContract.connect(investor2).depositTokens(77760000);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(77760000);

    // Get current block timestamp
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    // Test create and view plan
    await fundraiseContract.connect(owner).createPlan(
      "test_plan_id",
      "test_project_id",
      "test_project_name",
      founder.address,
      77750000,
      10,
      timestampBefore + 10000
    );

    // Investor1 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 100]);
    await fundraiseContract.connect(investor1).investInPlan(77750000, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77750000);
    expect(expected[4]).to.equal(77750000);

    // Investor2 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 200]);
    await fundraiseContract.connect(investor2).investInPlan(100, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77750100);
    expect(expected[4]).to.equal(77750100);

    // Investor1 invest in plan again successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 300]);
    await fundraiseContract.connect(investor1).investInPlan(10000, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77760100);
    expect(expected[4]).to.equal(77760100);

    // Investor2 fails to invest (oversubscribed)
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 400]);
    await expect(fundraiseContract.connect(investor2).investInPlan(77750000, "test_plan_id")).to.be.revertedWith("Oversubscribed");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77760100);
    expect(expected[4]).to.equal(77760100);

    // Investor1 fails to invest (expired)
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 11000]);
    await expect(fundraiseContract.connect(investor2).investInPlan(20, "test_plan_id")).to.be.revertedWith("Plan already closed");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77760100);
    expect(expected[4]).to.equal(77760100);

    // Plan unlocked
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(0);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(10000);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(77759900);
    await fundraiseContract.connect(founder).unlockPlan("test_plan_id");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(77760100);
    expect(expected[4]).to.equal(0);

    // Founder accumulate in alluo
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 15000]);
    await expect(fundraiseContract.connect(investor2).investInPlan(20, "test_plan_id")).to.be.revertedWith("Plan already closed");
    expect(await fundraiseContract.alluoBalanceOf(founder.address)).to.equal(41590);
  });
})