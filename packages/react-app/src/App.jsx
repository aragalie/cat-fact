import { Button, Menu } from "antd";
import "antd/dist/antd.css";
import { useContractLoader, useUserProviderAndSigner } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import { Account, Contract, Header, ThemeSwitch, NetworkDisplay } from "./components";
import { NETWORKS, INFURA_ID } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Web3ModalSetup } from "./helpers";
import { Instructions } from "./views";
import { useStaticJsonRPC } from "./hooks";

const { ethers } = require("ethers");
const web3Modal = Web3ModalSetup();

export const initialNetwork = NETWORKS.kovan;

// 🛰 providers
const providers = [
  "https://rpc.scaffoldeth.io:48544",
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://kovan.infura.io/v3/${INFURA_ID}`,
  // `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
];

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const location = useLocation();

  const targetNetwork = NETWORKS.kovan;

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);
  const kovanProvider = useStaticJsonRPC(providers);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  const kovanContracts = useContractLoader(kovanProvider, contractConfig);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flex: 1 }}>
            <Account
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />
          </div>
        </div>
      </Header>
      <NetworkDisplay
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
      <Menu style={{ textAlign: "center" }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">🏁 Start here 👇</Link>
        </Menu.Item>
        <Menu.Item key="/catfact">
          <Link to="/catfact">🐈 CatFact Contract</Link>
        </Menu.Item>
        <Menu.Item key="/linktoken">
          <Link to="/linktoken">🔗 LINK Token Interface</Link>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route exact path="/">
          <Instructions />
        </Route>

        <Route path="/catfact">
          <Contract
            name="CatFact"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>

        <Route path="/linktoken">
          <Contract
            name="LINK"
            customContract={kovanContracts && kovanContracts.contracts && kovanContracts.contracts.LINK}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={NETWORKS.kovan.blockExplorer}
            contractConfig={contractConfig}
            chainId={42}
          />
        </Route>
      </Switch>

      <ThemeSwitch />
      <Button
        style={{
          position: "fixed",
          align: "left",
          bottom: 0,
          right: 0,
          paddingBottom: 32,
          alignContent: "left",
        }}
        type="link"
        shape="round"
        icon=" 🏗 "
        onClick={() => {
          window.open("https://docs.scaffoldeth.io/scaffold-eth/");
        }}
      >
        made with Scaffold-eth
      </Button>
    </div>
  );
}
export default App;
