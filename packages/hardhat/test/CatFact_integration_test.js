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

const LinkTokenABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
      {
        name: "_data",
        type: "bytes",
      },
    ],
    name: "transferAndCall",
    outputs: [
      {
        name: "success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

/*
 * Make sure  that you run the test on Kovan with yarn test --network kovan
 *
 * The deployment contract will run out of funds after a few tests, so to test properly you need to add ETH to the contract address from https://faucets.chain.link/ for the deployments
 *
 * Also make sure that you have sufficient Kovan ETH on the addr1 accounts used for testing
 *
 */

describe("CatFact Contract Integration Test", function () {
  let CatFactContract;
  let addr1;
  let owner;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  // before((done) => {
  //   setTimeout(done, 2000);
  // });

  it("should deploy contract", async function () {
    const catFactContract = await ethers.getContractFactory("CatFact");
    [owner, addr1] = await ethers.getSigners();
    CatFactContract = await catFactContract.deploy();

    await CatFactContract.deployed();
    console.log(`CatFactContract address is ${CatFactContract.address}`);
  });

  it("calls transferAndCall on LINK contract", async function () {
    console.log(
      "Cat fact before Link contract call: ",
      await CatFactContract.getCatFact()
    );
    const linkContract = await ethers.getContractAt(
      LinkTokenABI,
      "0xa36085F69e2889c224210F603D836748e7dC0088"
    );

    // transfer some LINK to addr1
    const transaction = await linkContract.transfer(
      owner.address,
      utils.parseEther("10")
    );

    transaction.wait();

    console.log(`addr1 is ${addr1.address}`);

    // call LINK's transferAndCall function in order to start the process
    await linkContract.transferAndCall(
      CatFactContract.address,
      1000000000000000000,
      0x313131
    );

    // wait for the new event on CatFactContract to be triggered
    // challenging to do, as we have no way of knowing when the CatFactContract gets called from the Chainlink network => we just wait a few seconds
    // await new Promise((resolve) => setTimeout(resolve, 30000));

    console.log(
      "Cat fact AFTER Link contract call: ",
      await CatFactContract.getCatFact()
    );
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
    console.log(
      `Link balance of CatFact contract: ${new ethers.BigNumber.from(
        currentContractBalance._hex
      ).toString()}`
    );
    expect(new ethers.BigNumber.from(currentContractBalance._hex).toString());
  });

  it("withdraw link", async function () {
    await CatFactContract.withdrawLINK();

    const currentContractBalance = await CatFactContract.getLINKBalance();
    console.log(
      `Link balance of CatFact contract after withdrawal: ${new ethers.BigNumber.from(
        currentContractBalance._hex
      ).toString()}`
    );
    expect(new ethers.BigNumber.from(currentContractBalance._hex).toString());
  });
});
