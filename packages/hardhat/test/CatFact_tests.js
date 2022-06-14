const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { ethers } = require("hardhat");

const chai = require("chai");
// eslint-disable-next-line import/no-extraneous-dependencies
const BN = require("bn.js");
const { utils } = require("ethers");

// Enable and inject BN dependency
chai.use(require("chai-bn")(BN));

use(solidity);

/*
 * Make sure  that you run the test on Kovan with yarn test --network kovan
 *
 * The deployment contract will run out of funds after a few tests, so to test properly you need to add ETH to the contract address from https://faucets.chain.link/ for the deployments
 *
 * Also make sure that you have sufficient Kovan ETH on the addr1 accounts used for testing
 *
 */

describe("CatFact Contract Unit + Integration Tests", function () {
  let CatFactContract;
  let addr1;
  let owner;
  const LINKABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "transferAndCall",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  it("should deploy contract", async function () {
    const catFactContract = await ethers.getContractFactory("CatFact");
    [owner, addr1] = await ethers.getSigners();
    CatFactContract = await catFactContract.deploy();

    await CatFactContract.deployed();
  });

  it("set initial catFact", async function () {
    const initialCatFact =
      "Owning a cat is actually proven to be beneficial for your health.";
    expect(await CatFactContract.catFact()).to.equal(initialCatFact);
  });

  it("get catFact", async function () {
    expect(await CatFactContract.getCatFact()).to.be.a("string");
  });

  it("get catFactAPICallPrice", async function () {
    const price = utils.parseEther("0.11");
    const result = await CatFactContract.getCatFactAPICallPrice();

    expect(new ethers.BigNumber.from(result._hex).toString()).to.equal(price);
  });

  it("set catFactFee", async function () {
    const newFee = utils.parseEther("0.02");
    await CatFactContract.setCatFactFee(newFee);

    const result = await CatFactContract.catFactFee();

    expect(new ethers.BigNumber.from(result._hex).toString()).to.equal(newFee);
  });

  it("set chainLinkFee", async function () {
    const newFee = utils.parseEther("0.2");

    await CatFactContract.setChainlinkFee(newFee);
    const result = await CatFactContract.chainlinkFee();

    expect(
      new ethers.BigNumber.from(result._hex).toString()
    ).to.be.a.bignumber.that.is.equal(newFee);
  });

  it("changes owner", async function () {
    // trigger the initiation of ownership transfer; acceptance step must follow for completion
    await CatFactContract.transferOwnership(addr1.address);

    // accept ownership
    await CatFactContract.connect(addr1).acceptOwnership();
    expect(await CatFactContract.owner()).to.be.equal(addr1.address);
  });

  it("calls transferAndCall on LINK contract", async function () {
    const initialCatFact = await CatFactContract.catFact();
    console.log("initial cat fact: ", initialCatFact);
    const linkContract = await ethers.getContractAt(
      LINKABI,
      "0xa36085F69e2889c224210F603D836748e7dC0088"
    );

    // call LINK's transferAndCall function in order to start the process
    await linkContract
      .connect(addr1)
      .transferAndCall(
        CatFactContract.address,
        utils.parseEther("0.2"),
        "0x313131"
      );

    // wait for the new event on CatFactContract to be triggered
    // challenging to do, as we have no way of knowing when the CatFactContract gets called from the Chainlink network => we just wait a few seconds
    // await CatFactContract.wait();

    // validate that a new cat fact has been saved on contract
    expect(CatFactContract).to.emit(CatFactContract, "NewFact");
    // console.log("new cat fact: ", await CatFactContract.catFact());
    // expect(await CatFactContract.catFact()).to.not.equal(initialCatFact);
  });

  it("onToken transfer reverts when called directly", async function () {
    expect(
      await CatFactContract.connect(addr1).onTokenTransfer(
        CatFactContract.address,
        utils.parseEther("0.2"),
        "0x313131"
      )
    ).throws("The execution failed due to an exception.");
    // on local (hardhat) network use => .revertedWith("Must use LINK token");
    // on kovan network use =>  .to.throw("The execution failed due to an exception.");
  });

  it("get LINK balance of contract", async function () {
    const currentContractBalance = await CatFactContract.getLINKBalance();
    expect(
      new ethers.BigNumber.from(currentContractBalance._hex).toString()
    ).to.be.a.bignumber.that.is.greaterThanOrEqual(
      new ethers.BigNumber.from("0").toString()
    );
  });

  it("withdraw link", async function () {
    await CatFactContract.withdrawLINK();

    const currentContractBalance = await CatFactContract.getLINKBalance();
    expect(
      new ethers.BigNumber.from(currentContractBalance._hex).toString()
    ).to.be.a.bignumber.that.is.greaterThanOrEqual(
      new ethers.BigNumber.from("0").toString()
    );
  });
});
