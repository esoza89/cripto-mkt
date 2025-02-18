// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Token} from "./Token.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


import "hardhat/console.sol";

contract Factory {
    uint256 public constant TARGET = 22.2139334400673 ether;
    uint256 public constant TOKEN_LIMIT = 800_000_000 ether;
    uint256 public immutable fee;
    uint256 public constant aValue = 125;
    uint256 public constant bValue = 28159104;
    uint256 public constant cValue = 18767696;
    uint256 public constant roundA = 10 ** 8;
    uint256 public constant roundB = 10 ** 6;
    uint256 public constant roundC = 10 ** 15;
    uint256 public totalTokens;
    address public developer;
    address public permit2Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
    address[] public tokens;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    mapping (address => TokenSale) public tokenToSale;
    mapping (address => mapping(address => uint)) public balances;


    event Created (address indexed token);
    event Buy (address indexed token, uint256 amount);
    
    constructor(uint256 _fee) {
        fee = _fee;
        developer = msg.sender;
    }

    function getTokenSale(uint256 _index) external view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getPrice(uint256 _sold) public pure returns (uint256){
        uint256 X = _sold / (10 ** 18);
        uint256 price = (aValue * roundA) + (bValue * X / roundB) + (cValue * X * X / roundC);
        //console.log("Factory getPrice: ", price);
        return price;
    }

    function getCost(uint256 _sold, uint256 _amount) public pure returns (uint256){
        uint256 X2 = (_sold + _amount) / (10 ** 18);
        uint256 X1 = _sold / (10 ** 18); 
        uint256 cost = (aValue * roundA * X2) + (bValue * (X2 ** 2) / (2 * roundB)) + (cValue * (X2 ** 3)/ (3 * roundC))
            - (aValue * roundA * X1) - (bValue * (X1 ** 2) / (2 * roundB)) - (cValue * (X1 ** 3) / (3 * roundC));
        //console.log("Factory getCost raw: ", cost);
        return cost;
    }

    function create(string memory _name, string memory _symbol, developer) external payable {
        require(msg.value >= fee, "Factory: Insufficient fee");

        Token token = new Token(msg.sender, _name, _symbol, 1_000_000_000 ether, developer);
        tokens.push(address(token));
        totalTokens++;

        TokenSale memory sale = TokenSale (
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        tokenToSale[address(token)] = sale;

        emit Created(address(token));
    }


    function buy(address _token, uint256 _amount) external payable {
        TokenSale storage sale = tokenToSale[_token];
        uint256 remainingTokens = TOKEN_LIMIT - sale.sold;

        require(sale.isOpen, "Factory: Buying closed");
        require(_amount > 1 ether, "Factory: Amount too low");
        require(_amount <= remainingTokens, "Factory: not enough tokens left");

        uint256 cost = getCost(sale.sold, _amount);
        //console.log("Factory buy cost: ", cost);

        require(msg.value >= cost, "Factory: Insufficient ETH received");

        sale.sold += _amount;

        sale.raised += cost;

        if(sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET){
            sale.isOpen = false;
        }
        
        Token(_token).transfer(msg.sender, _amount);
        balances[_token][msg.sender] += _amount;

        emit Buy(_token, _amount);

        if(sale.isOpen == false) {
            createLiquidityPool(sale);
        }

    }

    function createLiquidityPool(TokenSale _sale) internal payable {
        
        PoolKey memory pool = PoolKey({
            currency0: CurrencyLibrary.ADDRESS_ZERO,
            currency1: _sale.token,
            fee: 3000,
            tickSpacing: 60,
            hooks: address(0)
        });

        uint256 startingPrice = 231709399179920000000000000000000;

        bytes[] memory params = new bytes[](2);
        params[0] = abi.encodeWithSelector(
            PositionManager.initializePool.selector,
            pool,
            startingPrice
        );

        bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));

        bytes[] memory mintParams = new bytes[](2);
        
        int24 tickLower = TickMath.minUsableTick(pool.tickSpacing);
        int24 tickUpper = TickMath.maxUsableTick(pool.tickSpacing);

        uint160 sqrtPriceAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtPriceBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            sqrtPriceAX96,
            sqrtPriceBX96,
            _sale.raised,
            _sale.sold
        );

        bytes memory hookData = "";

        mintParams[0] = abi.encode(pool, tickLower, tickUpper, liquidity, _sale.raised, _sale.sold, address(this), hookData);

        mintParams[1] = abi.encode(pool.currency0, pool.currency1);

        uint256 deadline = block.timestamp + 60;
        params[1] = abi.encodeWithSelector(
            PositionManager.modifyLiquidities.selector, abi.encode(actions, mintParams), deadline
        );

        IERC20(CurrencyLibrary.ADDRESS_ZERO).approve(address(permit2Address), type(uint256).max);
        Token(_sale.token).approve(address(permit2Address), type(uint256).max);

        IAllowanceTransfer(address(permit2Address)).approve(CurrencyLibrary.ADDRESS_ZERO, address(positionManager), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(address(permit2Address)).approve(_sale.token, address(positionManager), type(uint160).max, type(uint48).max);

        PositionManager(PositionManager).multicall{value: _sale.raised}(params);

    }

    function deposit(address _token) external payable {
        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: Target not reached");

        token.transfer(sale.creator, token.balanceOf(address(this)));

        (bool success, ) = sale.creator.call{value: address(this).balance}("");
        require(success, "Factory: Transfer failed");
    }

    function withdraw() external {
        require(msg.sender == developer, "Factory: Unauthorized");

        (bool success, ) = payable(developer).call{value: address(this).balance}("");
        require(success, "Factory: Transfer failed");
    }


}
