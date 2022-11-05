const { expect } = require('chai');
const { ethers, network } = require("hardhat");


describe('Fundraise contract', () => {
  it("Test create and read plan", async function () {
    // Deploy Fundraise contract
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2");
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

    // Deploy Token contract and transfer funds to investor accounts
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy();
    await tokenContract.connect(owner).transfer(investor1.address, 200);
    expect(await tokenContract.balanceOf(investor1.address)).to.equal(200);
    await tokenContract.connect(owner).transfer(investor2.address, 500);
    expect(await tokenContract.balanceOf(investor2.address)).to.equal(500);

    // Deploy Fundraise contract and initialize base token contract as above Token contract
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2");
    expect(await fundraiseContract._owner()).to.equal(owner.address);
    await fundraiseContract.connect(owner).updateBaseTokenContract(tokenContract.address);

    // Investors set allowance for fundraise contract to transfer funds
    await tokenContract.connect(investor1).increaseAllowance(fundraiseContract.address, 200);
    expect(await tokenContract.allowance(investor1.address, fundraiseContract.address)).to.equal(200);
    await tokenContract.connect(investor2).increaseAllowance(fundraiseContract.address, 500);
    expect(await tokenContract.allowance(investor2.address, fundraiseContract.address)).to.equal(500);

    // Investor deposit token into fundraise contract
    await fundraiseContract.connect(investor1).depositTokens(200);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(200);
    await fundraiseContract.connect(investor2).depositTokens(300);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(300);

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
      100,
      10,
      timestampBefore + 10000
    );

    // Investor1 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 100]);
    await fundraiseContract.connect(investor1).investInPlan(20, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(20);
    expect(expected[4]).to.equal(20);

    // Investor2 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 200]);
    await fundraiseContract.connect(investor2).investInPlan(100, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(120);
    expect(expected[4]).to.equal(120);

    // Investor1 invest in plan again successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 300]);
    await fundraiseContract.connect(investor1).investInPlan(30, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(150);
    expect(expected[4]).to.equal(150);

    // Investor2 fails to invest (oversubscribed)
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 400]);
    await expect(fundraiseContract.connect(investor2).investInPlan(60, "test_plan_id")).to.be.revertedWith("Oversubscribed");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(150);
    expect(expected[4]).to.equal(150);

    // Investor1 fails to invest (expired)
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 11000]);
    await expect(fundraiseContract.connect(investor2).investInPlan(20, "test_plan_id")).to.be.revertedWith("Plan already closed");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(150);
    expect(expected[4]).to.equal(150);

    // Plan unlocked
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(0);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(150);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(200);
    await fundraiseContract.connect(founder).unlockPlan("test_plan_id");
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(150);
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(150);
    expect(expected[4]).to.equal(0);

    // Founder withdraw
    await fundraiseContract.connect(founder).withdraw(100);
    expect(await tokenContract.balanceOf(founder.address)).to.equal(100);
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(50);
  });

  it("Test deposit, invest, refund plan", async function () {
    const [owner, founder, investor1, investor2] = await ethers.getSigners();

    // Deploy Token contract and transfer funds to investor accounts
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.deploy();
    await tokenContract.connect(owner).transfer(investor1.address, 200);
    expect(await tokenContract.balanceOf(investor1.address)).to.equal(200);
    await tokenContract.connect(owner).transfer(investor2.address, 500);
    expect(await tokenContract.balanceOf(investor2.address)).to.equal(500);

    // Deploy Fundraise contract and initialize base token contract as above Token contract
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0x51c59c6cAd28ce3693977F2feB4CfAebec30d8a2");
    expect(await fundraiseContract._owner()).to.equal(owner.address);
    await fundraiseContract.connect(owner).updateBaseTokenContract(tokenContract.address);

    // Investors set allowance for fundraise contract to transfer funds
    await tokenContract.connect(investor1).increaseAllowance(fundraiseContract.address, 200);
    expect(await tokenContract.allowance(investor1.address, fundraiseContract.address)).to.equal(200);
    await tokenContract.connect(investor2).increaseAllowance(fundraiseContract.address, 500);
    expect(await tokenContract.allowance(investor2.address, fundraiseContract.address)).to.equal(500);

    // Investor deposit token into fundraise contract
    await fundraiseContract.connect(investor1).depositTokens(200);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(200);
    await fundraiseContract.connect(investor2).depositTokens(300);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(300);

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
      100,
      10,
      timestampBefore + 10000
    );

    // Investor1 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 100]);
    await fundraiseContract.connect(investor1).investInPlan(20, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(20);
    expect(expected[4]).to.equal(20);

    // Investor2 invest in plan successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 200]);
    await fundraiseContract.connect(investor2).investInPlan(10, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(30);
    expect(expected[4]).to.equal(30);

    // Investor1 invest in plan again successfully
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 300]);
    await fundraiseContract.connect(investor1).investInPlan(30, "test_plan_id")
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(60);
    expect(expected[4]).to.equal(60);

    // Investor2 fails to invest (too small)
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 400]);
    await expect(fundraiseContract.connect(investor2).investInPlan(5, "test_plan_id")).to.be.revertedWith("Min investment requirements not met");
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(60);
    expect(expected[4]).to.equal(60);

    // Plan refunded
    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 11000]);
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(0);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(150);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(290);
    await fundraiseContract.refundPlan("test_plan_id");
    expect(await fundraiseContract.balanceOf(founder.address)).to.equal(0);
    expect(await fundraiseContract.balanceOf(investor1.address)).to.equal(200);
    expect(await fundraiseContract.balanceOf(investor2.address)).to.equal(300);
    var expected = await fundraiseContract.viewPlanStatus("test_plan_id");
    expect(expected[3]).to.equal(60);
    expect(expected[4]).to.equal(0);
  });
})