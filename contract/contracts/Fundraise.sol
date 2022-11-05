// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Fundraise {
    struct FundraisePlan {
        string plan_id;
        string project_id;
        string project_name;
        address base_token_contract;
        address payout_address;
        uint256 target_amount;
        uint256 minimum_investment_amount;
        uint256 expiration_time;
        uint256 total_funded_amount;
        uint256 locked_amount;
    }

    struct Investment {
        string plan_id;
        address investor;
        uint256 amount;
    }

    // The owner of the contract
    address public _owner;

    address _default_base_token_contract;

    mapping(string => FundraisePlan) _plan_id_to_plan;

    mapping(string => Investment[]) _plan_allocations;

    mapping(address => Investment[]) _investor_investments;

    mapping(address => uint256) _balances;

    uint256 public btcPrice;

    constructor(address payable _tellorAddress) public {
        _owner = msg.sender;
    }

    function updateBaseTokenContract(address base_token_contract) public {
        require(msg.sender == _owner, "Only allowed by owner");
        _default_base_token_contract = base_token_contract;
    }

    // For projects to create their fundraising plan
    function createPlan(
        string memory plan_id,
        string memory project_id,
        string memory project_name,
        address payout_address,
        uint256 target_amount,
        uint256 minimum_investment_amount,
        uint256 expiration_time
    ) public {
        _plan_id_to_plan[plan_id] = FundraisePlan({
            plan_id: plan_id,
            project_id: project_id,
            project_name: project_name,
            base_token_contract: _default_base_token_contract,
            payout_address: payout_address,
            target_amount: target_amount,
            minimum_investment_amount: minimum_investment_amount,
            expiration_time: expiration_time,
            total_funded_amount: 0,
            locked_amount: 0
        });
    }

    // View details of a plan
    function viewPlanStatus(string memory plan_id)
        public
        view
        returns (uint256[5] memory)
    {
        FundraisePlan memory plan = _plan_id_to_plan[plan_id];
        return [
            plan.target_amount,
            plan.minimum_investment_amount,
            plan.expiration_time,
            plan.total_funded_amount,
            plan.locked_amount
        ];
    }

    // For investors to invest in a plan
    function investInPlan(uint256 amount, string memory plan_id) external {
        // TODO
    }

    // To unlock funds from a plan
    function unlockPlan(string memory plan_id) public {
        // TODO
    }

    // To refund funds from a plan
    function refundPlan(string memory plan_id) public {
        // TODO
    }

    // For anyone to withdraw their tokens
    function withdrawTokens(uint256 amount) external {
        // TODO
    }

    // For investors to deposit token
    function depositTokens(uint256 amount) external {
        // TODO
    }

    // To view balance of an address
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
}
