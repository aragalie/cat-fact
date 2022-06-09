import React from "react";

function Instructions() {
  return (
    <div>
      <div
        style={{
          position: "fixed",
          textAlign: "left",
          paddingTop: 20,
          paddingLeft: 20,
          paddingBottom: 30,
        }}
      >
        <h2>This is a showcase build of how you can call an external API from a smart contract</h2>
        <div style={{ fontSize: 15, fontWeight: "bolder", paddingTop: 10 }}>
          <p>1. Connect your wallet to Kovan Test Net</p>
          <p>
            {" "}
            2. Get Kovan LINK token from the{" "}
            <a href="https://faucets.chain.link/" target={"_blank"} rel="noreferrer">
              Chainlink Faucet
            </a>{" "}
          </p>
          <p>
            3. Understand the <strong>CatFact Contract</strong> flow:
          </p>
          <div style={{ textAlign: "left", paddingLeft: 80, paddingBottom: 30, paddingTop: 10 }}>
            This contract enables a caller to request a new cat fact from
            <br />
            the{" "}
            <a href="https://catfact.ninja" target={"_blank"} rel="noreferrer">
              https://catfact.ninja
            </a>{" "}
            external API, with the help of the Chainlink client.
            <br />
            <br />
            There is a cost 😱 to request a new cat fact:
            <div style={{ paddingLeft: 20, paddingTop: 20 }}>
              💰 0.1 LINK which is paid to the Chainlink network for the API call
              <br />
              💰 0.01 LINK as a fee for this contract.
            </div>
            <br />
            In the future these fees can change, so the latest fees can be obtained by
            <br />
            calling the <code>getCatFactAPICallPrice()</code> function on this contract.
            <br />
            <br />
            Enough explanations, how do I get a 🐈 fact?
            <br />
            <br />- The caller must send a transaction to <strong style={{ color: "red" }}>
              LINK&apos;s contract
            </strong>{" "}
            <code>transferAndCall()</code>
            <br />
            function (you can get the contract&apos;s addressess{" "}
            <a href="https://docs.chain.link/docs/link-token-contracts" target={"_blank"} rel="noreferrer">
              here
            </a>{" "}
            ) with sufficient
            <br />
            tokens as noted above, and the address of this contract.
            <br />
            <div style={{ paddingLeft: 20, paddingTop: 20 }}>
              Transaction details:
              <br />
              👉 to: (address of the <strong>CatFact Contract</strong>)
              <br />
              👉 value: 0.11 LINK (can change over time, see more details below)
              <br />
              👉 data: (your favorite cat name)
            </div>
            <br />- The{" "}
            <strong style={{ color: "red" }}>
              LINK contract will transfer the LINK received from the caller to this
            </strong>
            <br />
            <strong style={{ color: "red" }}>contract, doing the entire ERC677 approve flow</strong>
            <br />
            - After verifying that sufficient LINK has been sent, this contract triggers
            <br />
            an API call request to the Chainlink network to retrieve a cat fact from the
            <br />
            external API.
            <br />
            - The API call is then fulfilled by Chainlink, the data is retrieved and the new
            <br />
            cat fact is returned to this contract. Please note that this operation can
            <br />
            take some time, also depending on the network and the API
            <br />
            - Once the Chainlink process is done, the caller can then call the
            <br />
            <code>getCatFact()</code> function on the <strong>CatFact Contract</strong> to retrieve the new cat fact 🙌
            <br />
          </div>
          <p>
            4. Call the LINK Contract (second tab) with the address of the <strong>CatFact Contract</strong> and a
            desired amount of LINK
          </p>
          <p>
            5. Test that everything works as expected on the <strong>CatFact Contract</strong> (third tab); the
            interface shows all variables and functions of the contract, even the ones that are not accessible (e.g
            onlyOwner), so you can test that the verifications are working properly. Live long and prosper! 🖖
          </p>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
