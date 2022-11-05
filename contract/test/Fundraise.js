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
          jsonRpcUrl: "https://polygon-mainnet.g.alchemyapi.io/v2/u_FXALLy4x1YgU3d25d6jSmEvX2pgdcc",
          //you can fork from last block by commenting next line
        },
      },],
    });
  });

  it("Test create and read plan", async function () {
    // Deploy Fundraise contract
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0xC2DbaAEA2EfA47EBda3E572aa0e55B742E408BF6", "0x3E14dC1b13c488a8d5D310918780c983bD5982E7");
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
    let usdcWhale = await ethers.getImpersonatedSigner("0xf89d7b9c864f589bbf53a82105107622b35eaa40");

    // Deploy Token contract and transfer funds to investor accounts
    const tokenContract = await ethers.getContractAt("Token", "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"); // USDC
    await tokenContract.connect(usdcWhale).transfer(investor1.address, 200);
    await tokenContract.connect(usdcWhale).transfer(investor2.address, 500);

    // Deploy Fundraise contract and initialize base token contract as above Token contract
    const Fundraise = await ethers.getContractFactory("Fundraise");
    const fundraiseContract = await Fundraise.deploy("0xC2DbaAEA2EfA47EBda3E572aa0e55B742E408BF6", "0x3E14dC1b13c488a8d5D310918780c983bD5982E7");
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
    const fundraiseContract = await Fundraise.deploy("0xC2DbaAEA2EfA47EBda3E572aa0e55B742E408BF6", "0x3E14dC1b13c488a8d5D310918780c983bD5982E7");
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