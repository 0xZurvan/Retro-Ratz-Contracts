// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Cheeze is ERC20, AccessControl {
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    uint256 public maxSupply = 20000e18;
    uint256 public buyPrice = 1e18;
    uint256 public burntSupply;

    address internal treasury;

    constructor(address _treasury) ERC20("Cheeze", "CHEEZE") {
        // Assigning roles.
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // One time mint for giveaways.
        _mint(_treasury, 5000e18);

        treasury = _treasury;
    }

    function buy(address to, uint256 amount) external payable {
        uint256 bigNumber = amount * buyPrice;

        require(msg.value >= bigNumber, "Must send right amount.");
        require(
            totalSupply() + bigNumber <= (maxSupply - burntSupply),
            "Max has been reached."
        );

        // Pay to the treasury
        payable(treasury).transfer(msg.value);

        // Mint the nft
        _mint(to, bigNumber);
    }

    function burn(address account, uint256 amount) external {
        require(
            hasRole(BURNER_ROLE, _msgSender()),
            "Must have burner role to burn... DUH."
        );
        require(maxSupply - burntSupply > 0, "Nothing to burn.");

        burntSupply += amount;
        _burn(account, amount);
    }

    function withdraw() external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Only admin can withdraw."
        );
        require(address(this).balance > 0);
        payable(treasury).transfer(address(this).balance);
    }

    function updateTreasury(address _treasury) external {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Only admin can update."
        );
        
        treasury = _treasury;
    }
}