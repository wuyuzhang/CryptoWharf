// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import "./interfaces/IIbAlluo.sol";
import "./interfaces/superfluid/ISuperfluid.sol";

interface IERC777Recipient {
    /**
     * @dev Called by an {IERC777} token contract whenever tokens are being
     * moved or created into a registered account (`to`). The type of operation
     * is conveyed by `from` being the zero address or not.
     *
     * This call occurs _after_ the token contract's state is updated, so
     * {IERC777-balanceOf}, etc., can be used to query the post-operation state.
     *
     * This function may revert to prevent the operation from being executed.
     */
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external;
}

interface IERC1820RegistryUpgradeable {
    function setInterfaceImplementer(
        address a,
        bytes32 b,
        address c
    ) external;
}

contract Fundraise is IERC777Recipient {
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

    bytes32 public constant CFA_ID =
        keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

    IERC1820RegistryUpgradeable internal constant _ERC1820_REGISTRY =
        IERC1820RegistryUpgradeable(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 private constant _TOKENS_RECIPIENT_INTERFACE_HASH =
        keccak256("ERC777TokensRecipient");

    // The owner of the contract
    address public _owner;

    address _default_base_token_contract;

    mapping(string => FundraisePlan) _plan_id_to_plan;

    mapping(string => Investment[]) _plan_allocations;

    mapping(address => Investment[]) _investor_investments;

    mapping(address => uint256) _balances;

    address _alluo_contract;

    address _superfluid_host;

    constructor(address alluo_contract, address superfluid_host) {
        _owner = msg.sender;
        _alluo_contract = alluo_contract;
        _superfluid_host = superfluid_host;

        // Grant permissions to the ibAlluo contract to create streams on your behalf
        ISuperfluid host = ISuperfluid(_superfluid_host);
        bytes memory data = IIbAlluo(_alluo_contract).formatPermissions();
        host.callAgreement(host.getAgreementClass(CFA_ID), data, "0x");

        // Set up ERC777 Recipient
        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            _TOKENS_RECIPIENT_INTERFACE_HASH,
            address(this)
        );
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

    function _internalInvestInPlan(
        address investor,
        uint256 amount,
        string memory plan_id
    ) internal {
        require(_balances[investor] >= amount, "Insufficient funds");
        require(
            block.timestamp <= _plan_id_to_plan[plan_id].expiration_time,
            "Plan already closed"
        );
        require(
            amount >= _plan_id_to_plan[plan_id].minimum_investment_amount,
            "Min investment requirements not met"
        );
        require(
            amount + _plan_id_to_plan[plan_id].total_funded_amount <=
                _plan_id_to_plan[plan_id].target_amount * 2,
            "Oversubscribed"
        );

        _balances[investor] -= amount;
        _plan_id_to_plan[plan_id].total_funded_amount += amount;
        _plan_id_to_plan[plan_id].locked_amount += amount;
        Investment memory investment;
        investment.plan_id = plan_id;
        investment.investor = investor;
        investment.amount = amount;
        _plan_allocations[plan_id].push(investment);
        _investor_investments[investor].push(investment);
    }

    // For investors to invest in a plan
    function investInPlan(uint256 amount, string memory plan_id) external {
        _internalInvestInPlan(msg.sender, amount, plan_id);
    }

    function delegateInvestInPlan(
        address investor,
        uint256 amount,
        string memory plan_id
    ) external {
        require(msg.sender == _owner, "Only allowed by owner");
        _internalInvestInPlan(investor, amount, plan_id);
    }

    // To unlock funds from a plan
    function unlockPlan(string memory plan_id) public {
        require(
            msg.sender == _owner ||
                msg.sender == _plan_id_to_plan[plan_id].payout_address,
            "Only allowed by owners"
        );
        require(
            _plan_id_to_plan[plan_id].total_funded_amount >=
                _plan_id_to_plan[plan_id].target_amount,
            "Target amount not met"
        );

        IERC20 ERC20Contract = IERC20(_default_base_token_contract);
        ERC20Contract.approve(
            _alluo_contract,
            _plan_id_to_plan[plan_id].locked_amount
        );
        IIbAlluo(_alluo_contract).deposit(
            _default_base_token_contract,
            _plan_id_to_plan[plan_id].locked_amount
        );
        IIbAlluo(_alluo_contract).createFlow(
            _plan_id_to_plan[plan_id].payout_address,
            int96(int256(_plan_id_to_plan[plan_id].locked_amount / 7776000)), // Stream over 90 days
            IIbAlluo(_alluo_contract).balanceOf(address(this)),
            7776000 // Stream over 90 days
        );
        _plan_id_to_plan[plan_id].locked_amount = 0;
    }

    // To refund funds from a plan
    function refundPlan(string memory plan_id) public {
        require(
            _plan_id_to_plan[plan_id].expiration_time < block.timestamp,
            "Raising hasn't expired"
        );
        require(
            _plan_id_to_plan[plan_id].total_funded_amount <
                _plan_id_to_plan[plan_id].target_amount,
            "Plan is funded, no longer refundable"
        );
        require(
            _plan_id_to_plan[plan_id].locked_amount > 0,
            "Plan already refunded"
        );
        for (uint256 i = 0; i < _plan_allocations[plan_id].length; i++) {
            address investor = _plan_allocations[plan_id][i].investor;
            uint256 amount = _plan_allocations[plan_id][i].amount;
            _balances[investor] += amount;
        }
        _plan_id_to_plan[plan_id].locked_amount = 0;
    }

    // For anyone to withdraw their tokens
    function withdraw(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "Insufficient fundss");
        IERC20 ERC20Contract = IERC20(_default_base_token_contract);
        ERC20Contract.transfer(msg.sender, amount);
        _balances[msg.sender] -= amount;
    }

    // For investors to deposit token
    function depositTokens(uint256 amount) external {
        IERC20 ERC20Contract = IERC20(_default_base_token_contract);
        ERC20Contract.transferFrom(msg.sender, address(this), amount);
        // TODO: swap incoming token to our base token
        _balances[msg.sender] += amount;
    }

    // To view balance of an address
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // To view balance of an address
    function alluoBalanceOf(address account) public view returns (int256) {
        return IIbAlluo(_alluo_contract).getBalance(account);
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {}

    // TODO: Get the list of investors of a project, for frontend to check and compare with lens protocol friends
}
