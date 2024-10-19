const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("SwapModule", (m) => {
    const swap = m.contract("TokenSwap");
    return { swap };
});