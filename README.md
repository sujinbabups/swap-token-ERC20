
### A Decentralized Token Swap Application

<img src="https://github.com/sujinbabups/token-swap/blob/main/ff786b1e80594d7ebf822e874cf997ea.webp" width="300px" height="200px">

## 📜 Overview

The **Token Swap DApp** is a decentralized application that allows users to seamlessly swap between ERC-20 tokens directly from their wallets. With this DApp, you can:
- Swap between predefined tokens.
- Set custom exchange rates.
- Easily connect to MetaMask for secure wallet interaction.

Built on Ethereum, this application utilizes smart contracts to facilitate trustless swaps between tokens.

---

## 🚀 Features

- **Token Swapping**: Effortlessly swap between tokens supported by the contract.
- **Custom Exchange Rates**: Admin can set exchange rates between two tokens.
- **MetaMask Integration**: Connect your wallet securely through MetaMask.
- **ERC-20 Token Standard**: Interact with any ERC-20 compatible token.
- **Responsive UI**: Built with a clean, user-friendly interface.

---

## Demo 📹
<a href="https://youtu.be/3xI30atp8Eg">
 <img align="center" alt="my dapp" src="https://github.com/sujinbabups/swap-token-ERC20/blob/main/yt.webp" width="200" height="150" /><br>
    </a>
---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity
- **Frontend**: React.js
- **Blockchain Interaction**: Ethers.js
- **Ethereum Network**: Deployed on Ethereum testnet.
- **Token Standards**: ERC-20

---



## ⚙️ Setup and Installation

Follow these steps to set up the Token Swap DApp on your local machine.

### Prerequisites
- **Node.js** and **npm** installed
- **MetaMask** browser extension
- **Ethereum test network** (Ropsten, Rinkeby, or others)

### 1. Clone the repository

``` bash
git clone https://github.com/sujinbabups/token-swap.git
cd token-swap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a \`.env\` file in the root directory with the following information:

\`\`\`
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_project_id
\`\`\`

### 4. Compile the contracts

```bash
npx hardhat compile
```

### 5. Deploy the contracts

```bash
npx hardhat ignition deploy ignition/modules/Swap.js
```

---

## 📖 Usage

### 1. Connect Wallet
- Open the app and click **Connect to MetaMask**. Ensure you have sufficient tokens in your wallet for the swap.

### 2. Choose Tokens
- Select the token you wish to swap **from** and the token you want to receive **to**.

### 3. Set Exchange Rate (Admin Only)
- If you're the admin, enter a custom exchange rate and set it via the **Set Exchange Rate** button.

### 4. Swap Tokens
- Enter the amount and click **Swap Tokens** to complete the transaction.

---

## 📈 Smart Contract Details

- **TokenSwap.sol**: The core contract responsible for handling the swapping logic, exchange rate management, and token transfer.
- **Admin-only functions**:
  - \`setExchangeRate(address fromToken, address toToken, uint256 rate)\`: Set a custom exchange rate between tokens.
- **User functions**:
  - \`swap(address fromToken, address toToken, uint256 amount)\`: Swap tokens at the current exchange rate.

---


This will execute a suite of unit tests ensuring the integrity of the token swap process.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sujinbabups/token-swap/issues).

---

## 📬 Contact

- **Author**: Sujin
- **Email**: sujinbabu85@gmail.com

---

By providing seamless token swaps, we aim to make decentralized trading more accessible to everyone. Happy swapping! 🎉



