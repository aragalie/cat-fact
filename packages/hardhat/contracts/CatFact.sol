pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract CatFact is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    LinkTokenInterface public LINK;

    string public catFact =
        "Owning a cat is actually proven to be beneficial for your health.";

    uint256 public chainlinkFee;
    uint256 public catFactFee;
    bytes32 private jobId;

    event NewFact(string catFact);

    /**
     * @notice Contract description and operating instructions
     *
     * This contract enables a caller to request a new cat fact from the
     * https://catfact.ninja external API, with the help of the Chainlink client.
     * The cat fact is then stored in the contract and can be publicly accessed.
     *
     * There is a cost to request a new cat fact:
     * - 0.1 LINK which is paid to the Chainlink network for the API call
     * - 0.01 LINK is paid as a fee to the contract for the storage of the fact
     *
     * In the future these fees can change, so the latest fees can be obtained by
     * calling the getCatFactAPICallPrice() function on this contract.
     *
     * To get a new cat fact:
     * - The caller must send a transaction to LINK's token base contract transferAndCall()
     *  function (see here the addresses
     *  https://docs.chain.link/docs/link-token-contracts/) with sufficient tokens
     *  as noted above, and the address of this contract.
     *
     *  Here is an example of the contents of the transaction:
     *
     *      _to: (address of this contract)
     *      _value: 110000000000000000 (corresponding to 0.11 LINK)
     *      _data: "" (your favorite cat name, in hex)
     *
     * - The LINK token base contract will then transfer the LINK to this contract
     * - After verifying that sufficient LINK has been sent, this contract
     *   triggers an API call request to the Chainlink network to retrieve a cat
     *   fact from the external API.
     * - The API call is then fulfilled by Chainlink, the data is retrieved and
     *   the new cat fact is returned to this contract. Please note that this
     *   operation can take some time, also depending on the network and the API
     * - Once the Chainlink process is done, the caller can then call the
     *   getCatFact() function on this contract to retrieve the new cat fact
     */

    /**
     * @notice Initialize the link token and target oracle on KOVAN TEST NETWORK
     *
     * Kovan Testnet details:
     * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
     * Oracle: 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656 (Chainlink DevRel)
     * jobId: 7d80a6386ef543a3abb52817f6707e3b
     *
     */
    constructor() ConfirmedOwner(msg.sender) {
        LINK = LinkTokenInterface(0xa36085F69e2889c224210F603D836748e7dC0088);

        setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
        setChainlinkOracle(0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656);
        
        jobId = "7d80a6386ef543a3abb52817f6707e3b";
        
        chainlinkFee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)

        // 10% of the Chainlink fee
        catFactFee = (1 * LINK_DIVISIBILITY) / 100; // 0,01 * 10**18 (Varies by network and job)
    }

    /**
     * Callback function for the Chainlink oracle network, updates the state of
     * the contract based on the oracle results
     */
    function fulfill(bytes32 _requestId, string memory _catFact)
        public
        recordChainlinkFulfillment(_requestId)
    {
        catFact = _catFact;
        emit NewFact(catFact);
    }

    /**
     * Provide the price of getting a new cat fact to the caller, to be used in
     * the call to LINK's contract via the transferAndCall() function.
     */
    function getCatFactAPICallPrice() public view returns (uint256) {
        return chainlinkFee + catFactFee;
    }

    /**
     * Provide cat fact from the contract's storage
     */
    function getCatFact() public view returns (string memory) {
        return catFact;
    }

    /**
     * This is the method called when a LINK transfer takes place to this
     * contract from LINK's base contract via its ERC677 transferAndCall()
     * function.
     */
    function onTokenTransfer(
        address _addr,
        uint256 _value,
        bytes calldata _data
    ) public onlyLINK {
        uint256 APICallPrice = getCatFactAPICallPrice();

        // check if the sender transferred enough LINK for at least 1 API call
        require(_value >= APICallPrice, "Not enough LINK");

        // There is no good way I can think of - for now :) - to limit the amount of LINK which can be sent to this contract.  
        //So if the caller sends more than 0.11, they still get just 1 API call => more profit for the contract but not great for the caller.

        requestCatFact();
    }

    modifier onlyLINK() {
        require(msg.sender == address(LINK), "Must use LINK token");
        _;
    }

    /**
     * Contract owner can set new fees
     */
    function setCatFactFee(uint256 _newCatFactFee) public onlyOwner {
        catFactFee = _newCatFactFee;
    }

    function setChainlinkFee(uint256 _newChainlinkFee) public onlyOwner {
        chainlinkFee = _newChainlinkFee;
    }

    /**
     * Check how much LINK the contract has
     */
    function getLINKBalance() public view returns (uint256) {
        (chainlinkTokenAddress());
        return LINK.balanceOf(address(this));
    }

    /**
     * Contract owner can withdraw the LINK from the contract
     */
    function withdrawLINK() public onlyOwner {
        (chainlinkTokenAddress());
        LINK.transfer(msg.sender, LINK.balanceOf(address(this)));
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data which is located in a list
     *
     * Function is set to private as the contract requires payment first in
     * order to retrieve new API data
     */
    function requestCatFact() private returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        // Set the URL to perform the GET request on
        req.add("get", "https://catfact.ninja/fact?max_length=256");
        req.add("path", "fact"); // Chainlink nodes 1.0.0 and later support this format

        // Sends the request to Chainlink
        return sendChainlinkRequest(req, chainlinkFee);
    }
}
