// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dapp is ReentrancyGuard ,Ownable {

    /// @notice ETH 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    address public constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;


    /// @notice erc20 token address
    IERC20 public immutable token;

    //----------------------------//
    //        Mappings            //
    //----------------------------//

    /// @notice user's erc20 token balances
    mapping (address=>uint256) public balances;

    //----------------------------//
    //          Error             //
    //----------------------------//
    error ZeroAmount(); 
    error TransferFaild();
    error IsufficientBalance();
    

    //----------------------------//
    //          Events            //
    //----------------------------//
    event Topup(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);


    constructor(IERC20 _token) {
        token = _token;
    }

    /**
     * @notice topup will fetch the given amount of tokens from the caller address
     * @param _amount of tokens to deposit
     */
    function topup(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();
        balances[msg.sender] += _amount;
        // fetch the tokens from the user wallet
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert TransferFaild();
        emit Topup(msg.sender, _amount);
    }

    /**
     * @notice withdraw will send the given amount of token to the caller address
     * @param _amount of tokens to withdraw
     */
    function withdraw(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert ZeroAmount();
        if(balances[msg.sender] < _amount) revert IsufficientBalance();
        
        balances[msg.sender] -= _amount;
        // transfer the given amount of token to the user address
        bool success = token.transfer(msg.sender, _amount);
        if (!success) revert TransferFaild();
        emit Withdraw(msg.sender, _amount);
    }

    /**
     * @notice balanceOf will return the smart contract token balance
     */
    function balanceOf() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
