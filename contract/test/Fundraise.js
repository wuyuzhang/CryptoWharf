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
})