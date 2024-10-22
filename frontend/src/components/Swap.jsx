import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ERC20ABI from '../scdata/ERC20ABI.json';
import abi from '../scdata/SwapModuleTokenSwap.json';
import deployed_address from '../scdata/deployed_addresses.json';

const tokens = {
  ST: "0xafE5452aE6Ab16c0013Cd473B1d3d0B2B35A1819",
  ET: "0xE6a6085DBbbD7f1AE5950B6973Ec9Cc1aDCFcD52",
  NewToken: "0xEd08E0c16a267B6385A0401D0209AD46dA241FA0"
};

const SwapABI = abi.abi;
const SWAP_CONTRACT_ADDRESS = deployed_address.SwapModuleTokenSwap;

const Swap = () => {
  const [account, setAccount] = useState('');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [newRate, setNewRate] = useState('');
  const [currentRate, setCurrentRate] = useState('0');
  // const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  // const setupExampleRate = async () => {
  //   if (!signer) return;

  //   try {
  //     const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SwapABI, signer);

  //     // Set a more reasonable rate (e.g., 1 GT = 2 ET)
  //     const newRate = ethers.parseEther("2");

  //     console.log("Setting new rate:", ethers.formatEther(newRate));
  //     const tx = await swapContract.setExchangeRate(tokens.GT, tokens.ET, newRate);
  //     await tx.wait();

  //     console.log("New rate set successfully");
  //     await getExchangeRate();
  //   } catch (error) {
  //     console.error("Error setting example rate:", error);
  //   }
  // };

  const transferTokensToContract = async () => {
    if (!signer) return;

    try {
      const etContract = new ethers.Contract(tokens.ET, ERC20ABI, signer);
      const amountToTransfer = ethers.parseEther("50"); // Set this to a value the user has or make it dynamic.

      // Check user balance
      const userBalance = await etContract.balanceOf(account);
      console.log("User ET Balance:", ethers.formatEther(userBalance));

      // Compare balances using BigInt
      if (BigInt(userBalance) < amountToTransfer) {
        console.error("Insufficient user balance");
        alert("Insufficient user balance");
        return;
      }

      // Check allowance
      const allowance = await etContract.allowance(account, SWAP_CONTRACT_ADDRESS);
      console.log("Current Allowance:", ethers.formatEther(allowance));

      // Compare allowances using BigInt
      if (BigInt(allowance) < amountToTransfer) {
        console.log("Insufficient allowance, approving tokens...");
        alert("Insufficient allowance, approving tokens")
        const approveTx = await etContract.approve(SWAP_CONTRACT_ADDRESS, amountToTransfer);
        await approveTx.wait();
        console.log("Tokens approved");
        alert("Tokens approved");
      }

      console.log("Transferring ET tokens to contract...");
      const tx = await etContract.transfer(SWAP_CONTRACT_ADDRESS, amountToTransfer);
      await tx.wait();

      console.log("Successfully transferred ET tokens to contract");

      // Check new contract balance
      const contractBalance = await etContract.balanceOf(SWAP_CONTRACT_ADDRESS);
      console.log("New contract ET balance:", ethers.formatEther(contractBalance));

    } catch (error) {
      console.error("Error transferring tokens to contract:", error);
      if (error.reason) {
        console.error("Reason:", error.reason);
      }
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }
  };

  const checkAllBalances = async () => {
    if (!signer) return;

    try {
      const gtContract = new ethers.Contract(tokens.ST, ERC20ABI, signer);
      const etContract = new ethers.Contract(tokens.ET, ERC20ABI, signer);

      // Get user balances
      const userGTBalance = await gtContract.balanceOf(account);
      const userETBalance = await etContract.balanceOf(account);

      // Get contract balances
      const contractGTBalance = await gtContract.balanceOf(SWAP_CONTRACT_ADDRESS);
      const contractETBalance = await etContract.balanceOf(SWAP_CONTRACT_ADDRESS);

      console.log("=== Balances ===");
      console.log("User ST Balance:", ethers.formatEther(userGTBalance));
      console.log("User ET Balance:", ethers.formatEther(userETBalance));
      console.log("Contract ST Balance:", ethers.formatEther(contractGTBalance));
      console.log("Contract ET Balance:", ethers.formatEther(contractETBalance));

    } catch (error) {
      console.error("Error checking balances:", error);
    }
  };

  const checkAndDisplayBalances = async (isPostSwapCheck = false) => {
    if (!signer || !fromToken || !toToken) return;

    try {
      const fromTokenContract = new ethers.Contract(tokens[fromToken], ERC20ABI, signer);
      const toTokenContract = new ethers.Contract(tokens[toToken], ERC20ABI, signer);

      const userFromBalance = await fromTokenContract.balanceOf(account);
      const contractToBalance = await toTokenContract.balanceOf(SWAP_CONTRACT_ADDRESS);

      if (isPostSwapCheck) {
        console.log("=== Swap Complete ===");
        console.log(`New ${fromToken} balance: ${ethers.formatEther(userFromBalance)}`);
        console.log(`New ${toToken} contract balance: ${ethers.formatEther(contractToBalance)}`);
      } else {
        console.log(`User's ${fromToken} balance:`, ethers.formatEther(userFromBalance));
        console.log(`Contract's ${toToken} balance:`, ethers.formatEther(contractToBalance));

        const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SwapABI, signer);
        const rate = await swapContract.getExchangeRate(tokens[fromToken], tokens[toToken]);
        console.log("Current exchange rate:", ethers.formatEther(rate));

        if (amount) {
          const amountIn = ethers.parseEther(amount);
          const expectedOut = (amountIn * rate) / ethers.parseEther("1");
          console.log("Expected output amount:", ethers.formatEther(expectedOut));

          if (expectedOut > contractToBalance) {
            console.error("⚠️ Contract doesn't have enough tokens for this swap");
          }
        }
      }
    } catch (error) {
      console.error("Error checking balances:", error);
    }
  };


  const setExchangeRate = async () => {
    if (!fromToken || !toToken || !newRate) return;
    setLoading(true);
    try {
      const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SwapABI, signer);

      const rateInWei = ethers.parseEther(newRate);
      const tx = await swapContract.setExchangeRate(tokens[fromToken], tokens[toToken], rateInWei);
      await tx.wait();
      alert("Exchange rate set ")

      await getExchangeRate();
      setNewRate('');
    } catch (error) {
      console.error("Error setting exchange rate:", error);
      alert("Error setting exchange rate. Check console for details.");
    }
    setLoading(false);
  };

  const getExchangeRate = async () => {
    if (!fromToken || !toToken) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SwapABI, provider);

      const rate = await swapContract.getExchangeRate(tokens[fromToken], tokens[toToken]);

      if (rate.toString() === '0') {
        console.error("Exchange rate not found for this token pair");
        setCurrentRate('0');
      } else {
        setCurrentRate(ethers.formatEther(rate));
      }
    } catch (error) {
      console.error("Error getting exchange rate:", error);
    }
  };

  const checkAllowanceAndBalance = async () => {
    if (!signer) {
      console.error("Signer is not defined");
      return false;
    }

    try {
      const fromTokenContract = new ethers.Contract(tokens[fromToken], ERC20ABI, signer);
      const signerAddress = await signer.getAddress();
      const balance = await fromTokenContract.balanceOf(signerAddress);
      console.log("Raw balance from contract:", balance.toString());

      const decimals = await fromTokenContract.decimals();

      if (!amount || isNaN(amount) || amount <= 0) {
        console.error("Invalid amount");
        return false;
      }

      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      console.log("Amount to swap in wei:", amountInWei.toString());

      const allowance = await fromTokenContract.allowance(signerAddress, SWAP_CONTRACT_ADDRESS);
      console.log("Allowance:", allowance.toString());

      if (balance < amountInWei) {
        console.error("Insufficient balance.");
        return false;
      }

      if (allowance < amountInWei) {
        console.log("Insufficient allowance, approving tokens...");
        const approveTx = await fromTokenContract.approve(SWAP_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
        alert("Tokens approved");

        console.log("Tokens approved");

      }

      return true;
    } catch (error) {
      console.error("Error checking allowance and balance:", error);
      return false;
    }
  };

  const swapTokens = async () => {
    try {
      if (!await checkAllowanceAndBalance()) {
        console.error("Failed allowance and balance check");
        return;
      }

      const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SwapABI, signer);
      const fromTokenContract = new ethers.Contract(tokens[fromToken], ERC20ABI, signer);
      const toTokenContract = new ethers.Contract(tokens[toToken], ERC20ABI, signer);

      const decimals = await fromTokenContract.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);

      console.log("Swap details:");
      console.log("From token:", tokens[fromToken]);
      console.log("To token:", tokens[toToken]);
      console.log("Amount:", amountInWei.toString());

      // Check User and Contract Balances

      const fromBalance = await fromTokenContract.balanceOf(account);
      const contractBalance = await toTokenContract.balanceOf(SWAP_CONTRACT_ADDRESS);
      console.log("User's from token balance:", fromBalance.toString());
      console.log("Contract's to token balance:", contractBalance.toString());

      const allowance = await fromTokenContract.allowance(account, SWAP_CONTRACT_ADDRESS);
      console.log("Current allowance:", allowance.toString());

      const rate = await swapContract.getExchangeRate(tokens[fromToken], tokens[toToken]);
      console.log("Current exchange rate:", rate.toString());

      // Get gas estimate
      const gasEstimate = await swapContract.swap.estimateGas(
        tokens[fromToken],
        tokens[toToken],
        amountInWei
      );

      // Add 20% buffer to gas estimate using regular number operations
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
      console.log("Gas Limit for swapping :", gasLimit);

      const tx = await swapContract.swap(
        tokens[fromToken],
        tokens[toToken],
        amountInWei,
        {
          gasLimit: gasLimit
        }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log("Tokens approved");

      alert("Tokens swapped successfully!");
      console.log("Tokens swapped successfully!");

      // Optional: Refresh balances after swap
      const isPostSwapCheck = true;
      await checkAndDisplayBalances(isPostSwapCheck);
    } catch (error) {
      console.error("Error swapping tokens:", error);
      if (error.reason) {
        console.error("Reason:", error.reason);
      }
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }
  };





  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 min-h-screen antialiased">
    <div className="container mx-auto px-4 py-6 md:py-12">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-6 md:mb-8 p-4 md:p-6 rounded-xl bg-gray-800">
        <h2 className="text-2xl md:text-4xl font-bold text-blue-400 mb-4 tracking-normal">Token Swap Platform</h2>
        <button
          onClick={connectWallet}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-base md:text-lg px-6 md:px-8 py-3 rounded-lg font-semibold text-white transition duration-300 border border-blue-500"
        >
          {account ? `Connected: ${account.substring(0, 6)}...${account.substring(38)}` : 'Connect to MetaMask'}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 max-w-7xl mx-auto p-4 md:p-8 rounded-xl bg-gray-800">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 md:space-y-8 lg:border-r lg:border-gray-700 lg:pr-8">
          {/* Swap Interface Card */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-8 border-2 border-gray-600 shadow-xl">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 md:mb-8 p-4 rounded-lg gap-4">
              <div className="flex-1 md:pr-4 md:border-r md:border-gray-600">
                <label className="block text-base md:text-lg font-bold mb-3 text-gray-300">From Token</label>
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 md:p-4 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Token</option>
                  <option value="ST">ST</option>
                  <option value="ET">ET</option>
                  <option value="NewToken">NewToken</option>
                </select>
              </div>
              <div className="flex-1 md:pl-4">
                <label className="block text-base md:text-lg font-bold mb-3 text-gray-300">To Token</label>
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 md:p-4 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Token</option>
                  <option value="ST">ST</option>
                  <option value="ET">ET</option>
                  <option value="NewToken">NewToken</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end space-y-4 md:space-y-0 md:space-x-4 p-4 rounded-lg">
              <div className="flex-1">
                <label className="block text-base md:text-lg font-bold mb-3 text-gray-300">Amount to Swap</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 md:p-4 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter amount to swap"
                />
              </div>
              <button
                onClick={swapTokens}
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-white transition duration-300 shadow-lg border border-purple-500"
              >
                Swap Tokens
              </button>
            </div>
          </div>

          {/* Token Management Card */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-8 border-2 border-gray-600 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-200 pb-4 border-b border-gray-600">Token Management</h3>
            <div className="flex flex-col space-y-4 p-4 rounded-lg">
              <button
                onClick={transferTokensToContract}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-base md:text-lg py-3 rounded-xl font-semibold text-white transition duration-300 border border-indigo-500"
              >
                Transfer ET to Contract
              </button>
              <button
                onClick={checkAllBalances}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-base md:text-lg py-3 rounded-xl font-semibold text-white transition duration-300 border border-indigo-500"
              >
                Check All Token Balances
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-6 md:space-y-8">
          {/* Exchange Rate Card */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-8 border-2 border-gray-600 shadow-xl">
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-200 pb-4 border-b border-gray-600">Exchange Rate Settings</h3>
            <div className="space-y-6 p-4 rounded-lg">
              <div>
                <label className="block text-base md:text-lg font-bold mb-3 text-gray-300">New Exchange Rate</label>
                <input
                  type="text"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 md:p-4 rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter new exchange rate"
                />
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 border-t border-gray-600 pt-4">
                <button
                  onClick={setExchangeRate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-3 rounded-xl font-semibold text-white transition duration-300 border border-blue-500"
                >
                  Set New Rate
                </button>
                <button
                  onClick={getExchangeRate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-base md:text-lg py-3 rounded-xl font-semibold text-white transition duration-300 border border-blue-500"
                >
                  Get Rate
                </button>
              </div>

              <div className="p-4 bg-gray-700 rounded-xl border-2 border-gray-600">
                <p className="text-center text-base md:text-lg font-semibold text-gray-200">
                  Current Rate: <span className="text-blue-400">{currentRate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Network Status Card */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-8 border-2 border-gray-600 shadow-xl">
            <div className="text-center space-y-4 p-4 rounded-lg">
              <p className="text-lg md:text-xl font-bold text-gray-200 pb-4 border-b border-gray-600">Current Network Status</p>
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600/20 border border-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-500 font-semibold">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  );
};

export default Swap;
