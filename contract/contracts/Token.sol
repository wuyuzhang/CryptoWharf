//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// This is the main building block for smart contracts.
contract Token is ERC20 {
    // An address type variable is used to store ethereum accounts.
    address public _owner;

    /**
     * Contract initialization.
     */
    constructor() ERC20("My Test Token", "MTT") {
        _mint(msg.sender, 1000000);
        _owner = msg.sender;
    }
}
