import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import "./App.css";
import horse from "./images/horse.png";
import cliff from "./images/cliff.webp";
import trees from "./images/trees.png";
import stars from "./images/stars.png";
// import Image from "next/image";
// import TronWeb from 'tronweb';
const TronWeb = require("tronweb");
const { ethers } = require("ethers");
// TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn-USDD

function App() {
  // const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(""); // Add state for selected network
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(""); // Add state for selected chain

  const ethereumEndpoints = {
    BscTestnet: "https://data-seed-prebsc-1-s1.binance.org:8545",
    BscMainnet: "https://bsc.drpc.org/",
    EthereumMainnet:
      "https://eth-mainnet.g.alchemy.com/v2/VyHjO-nXl8uaYsuVvKaV9kGv0QkiWoUX",
    PolygonMumbaiTestnet: "https://polygon-mumbai.drpc.org",
    Sepolia: "https://rpc.sepolia.org",
    Goerli:
      "https://eth-goerli.g.alchemy.com/v2/Lk8SHaXxZbcPNBWwFBGEnJ_uLa1dQhre",
  };

  const tronEndpoints = {
    TronMainnet: "https://api.trongrid.io/jsonrpc",
    // TronNile: "https://api.nile.trongrid.io/",
    // TronShastaTestnet: "https://api.shasta.trongrid.io",
  };

  const tronCurrencies = ["TRX", "USDD", "USDT"];

  window.Buffer = window.Buffer || Buffer;

  useEffect(() => {
    console.log(walletBalance);
  }, [walletBalance]);

  const getBalance = async () => {
    if (inputAddress && selectedChain && selectedNetwork) {
      try {
        let provider;
        if (selectedNetwork === "ethereum") {
          provider = new ethers.providers.JsonRpcProvider(
            ethereumEndpoints[selectedChain]
          );
          const balance = await provider.getBalance(inputAddress);
          setWalletBalance(ethers.utils.formatEther(balance));
        } else if (selectedNetwork === "tron" && window.tronWeb) {
          let fullHost;
          let apiKey;
          const privateKey =
            "1bb57d425f811847a1c7c311824fef3e07bb7ff8c7e64967df7ce64d791827c3";

          // Configure fullHost and apiKey based on selected chain
          if (selectedChain === "TronMainnet") {
            fullHost = "https://api.trongrid.io";
            apiKey = "91bdcc3a-097e-43ae-9883-e67fee39de3e";
          } else if (selectedChain === "TronNile") {
            fullHost = "https://api.nileex.io";
            apiKey = "f23001c6-5457-4871-94c0-9f57fc23e685";
          } else if (selectedChain === "TronShastaTestnet") {
            fullHost = "https://api.shasta.trongrid.io";
            apiKey = "cfeccfbc-73b6-4775-b7d6-01a5e364d769";
          } else {
            console.log("Invalid chain selected");
            return;
          }

          const tronWeb = new TronWeb({
            fullHost,
            headers: {
              "TRON-PRO-API-KEY": apiKey,
            },
            privateKey,
          });

          // Fetch balance based on selected currency
          let tronBalance;
          if (selectedCurrency === "TRX") {
            tronBalance = await tronWeb.trx.getBalance(inputAddress);
            setWalletBalance(
              ethers.utils.formatUnits(tronBalance.toString(), 6)
            );
          } else {
            try {
              let contractAddress;
              let decimalPlaces;

              if (selectedCurrency === "USDD") {
                contractAddress = "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn";
                decimalPlaces = 11; // Adjust this based on the token's actual configuration
              } else if (selectedCurrency === "USDT") {
                contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
                decimalPlaces = 6; // Adjust this based on the token's actual configuration
              } else {
                console.error("Invalid currency selected");
                return;
              }

              const contract = await tronWeb.contract().at(contractAddress);
              const tokenBalanceRaw = await contract
                .balanceOf(inputAddress)
                .call();

              // Convert raw balance to readable format
              const tokenBalance = tokenBalanceRaw / 10 ** decimalPlaces;

              setWalletBalance(
                ethers.utils.formatUnits(
                  tokenBalanceRaw.toString(),
                  decimalPlaces
                )
              );
            } catch (error) {
              console.error(
                `Error fetching ${selectedCurrency} balance:`,
                error
              );
            }
          }
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    } else {
      console.log(
        "Please select a network, chain, currency, and enter an address"
      );
    }
  };
  // console.log(walletBalance);
  // console.log(walletBalance);

  return (
    <div className="background-image">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 className="navbar-item is-size-4">BalanzeoX: OmniWallet</h1>
        </div>
        <div id="navbarMenu" className="navbar-menu">
          <div className="navbar-end is-align-items-center">
            <div className="drop">
              <select
                className="select-chain"
                value={selectedNetwork}
                onChange={(e) => {
                  setSelectedNetwork(e.target.value);
                  // Reset chain and input values when changing the network
                  setSelectedChain("");
                  setInputAddress("");
                  setWalletBalance("");
                }}
              >
                {!selectedNetwork && (
                  <option className="dropdown" value="">
                    Select Network
                  </option>
                )}
                <option className="dropdown" value="ethereum">
                  Ethereum
                </option>
                <option className="dropdown" value="tron">
                  Tron
                </option>
              </select>
              {/* Conditionally render chain selection dropdown */}
              {selectedNetwork && (
                <select
                  className="select-chain"
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                >
                  {!selectedChain && (
                    <option className="dropdown" value="">
                      Select Chain
                    </option>
                  )}
                  {selectedNetwork === "ethereum" &&
                    Object.keys(ethereumEndpoints).map((chain) => (
                      <option className="dropdown" key={chain} value={chain}>
                        {chain}
                      </option>
                    ))}
                  {selectedNetwork === "tron" &&
                    Object.keys(tronEndpoints).map((chain) => (
                      <option className="dropdown" key={chain} value={chain}>
                        {chain}
                      </option>
                    ))}
                </select>
              )}
              {selectedChain && selectedNetwork === "tron" && (
                <select
                  className="select-chain"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {!selectedCurrency && (
                    <option className="dropdown" value="">
                      Select Currency
                    </option>
                  )}
                  {tronCurrencies.map((currency) => (
                    <option
                      className="dropdown"
                      key={currency}
                      value={currency}
                    >
                      {currency}
                    </option>
                  ))}
                </select>
              )}

              {/* Conditionally render input field for address and Get Balance button */}
              {selectedChain && (
                <>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Enter address"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                  />
                  <button className="balance-button" onClick={getBalance}>
                    Get Balance
                  </button>
                  {/* Display balance */}
                  {walletBalance && walletBalance.length > 0 && (
                    <p className="balance-text">
                      Balance: {walletBalance}{" "}
                      {selectedNetwork === "ethereum"
                        ? "ETH"
                        : selectedCurrency === "TRX"
                        ? "TRX"
                        : selectedCurrency}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="horse-cliff">
        <img src={horse} alt="horse" height={30} width={30} className="horse" />
        <img src={cliff} className="cliff" alt="cliff" width={48} height={48} />
      </div>
      <div className="trees">
        <img src={trees} alt="trees" width={1930} height={360} className="" />
      </div>
      <div className="stars">
        <img src={stars} alt="stars" height={30} width={30} className="" />
      </div>
    </div>
  );
}

export default App;
