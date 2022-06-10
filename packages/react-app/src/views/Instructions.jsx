import React from "react";

function Instructions() {
  return (
    <div style={{ textAlign: "center", textJustify: "left" }}>
      <div
        style={{
          position: "fixed",
          paddingTop: 20,
          paddingLeft: 20,
          paddingBottom: 30,
          paddingRight: 120,
        }}
      >
        <h2>This is a showcase build of how you can call an external API from a smart contract</h2>
        <div style={{ fontSize: 15, fontWeight: "bolder", paddingTop: 10 }}>
          1. Connect your wallet to Kovan Test Net and get Kovan LINK token from the{" "}
          <a href="https://faucets.chain.link/" target={"_blank"} rel="noreferrer">
            Chainlink Faucet
          </a>{" "}
          <br />
          2. Understand the <strong>CatFact Contract</strong> flow:
          <br />
          <div style={{ textAlign: "left", paddingLeft: 120, paddingBottom: 30, paddingTop: 10 }}>
            This contract enables a caller to request a new cat fact from the{" "}
            <a href="https://catfact.ninja" target={"_blank"} rel="noreferrer">
              https://catfact.ninja
            </a>{" "}
            external API, with the help of{"  "}
            <a href="https://chain.link/" target={"_blank"} rel="noreferrer">
              Chainlink
            </a>
            .
            <br />
            There is a cost 😱 to request a new cat fact: 💰 0.1 LINK which is paid to the Chainlink network for the API
            call + 💰 0.01 LINK as a fee for this contract.
            <br />
            In the future these fees can change, so the latest fees can be obtained by calling the{" "}
            <i>getCatFactAPICallPrice()</i> function on this contract.
            <br />
            <br />- The caller must send a transaction to <i style={{ color: "teal" }}>LINK&apos;s contract</i>{" "}
            <i>transferAndCall()</i>
            function (addressess{" "}
            <a href="https://docs.chain.link/docs/link-token-contracts" target={"_blank"} rel="noreferrer">
              here
            </a>{" "}
            ) with sufficient tokens.
            <br /> Here's how the transaction looks like:
            <div style={{ paddingLeft: 20 }}>
              👉 to: (address of the <strong>CatFact Contract</strong>)
              <br />
              👉 value: 0.11 LINK (can change over time, see more details below)
              <br />
              👉 data: (your favorite cat name)
            </div>
            <br />- The{" "}
            <i style={{ color: "teal" }}>
              LINK contract will transfer the LINK received from the caller to the CatFact contract
            </i>
            , and do the entire ERC20+ERC677 approval flow in one single transaction 🥳
            <br />
            - After verifying that sufficient LINK has been sent, the CatFact contract triggers an API call request to
            the Chainlink network to retrieve a cat fact from the external API.
            <br />
            - The API call is then fulfilled by Chainlink, the data is retrieved and the new cat fact is returned to the
            contract.
            <br />- Once the Chainlink process is done, the <i>getCatFact()</i> function on the CatFact Contract can be
            called to retrieve the new cat fact 🙌
            <br />
            <br />
            4. Have fun testing out the entire flow with the tabs above, and give it a bit for the Link contract to
            load..kovan be slooooow 😉 🚀
            <br />
            <br />
            👨‍💻 I simplified the ABI of the LINK contract down to just one function, and the verified source code of the
            CatFact contract can be found {"  "}
            <a
              href="https://kovan.etherscan.io/address/0x3813430946FBDec7cd9806ED6889e6E467Aa9018"
              target={"_blank"}
              rel="noreferrer"
            >
              here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
