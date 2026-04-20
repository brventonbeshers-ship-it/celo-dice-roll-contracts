// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DiceRollV2
 * @dev Core game contract for the Dice Roll dApp on Celo
 */
contract DiceRollV2 {
    uint256 public constant SIDES = 6;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 10 ether;

    address public owner;
    bool public gamePaused;
    uint256 public totalRolls;
    uint256 public totalWins;

    struct UserStats {
        uint256 rolls;
        uint256 wins;
        uint256 lastRoll;
        uint256 lastResult;
    }

    mapping(address => UserStats) public userStats;

    event DiceRolled(address indexed player, uint256 guess, uint256 result, bool win);
    event GamePaused(bool paused);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier whenNotPaused() {
        require(!gamePaused, "Game is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function rollDice(uint256 guess) external whenNotPaused returns (uint256 result, bool win) {
        require(guess >= 1 && guess <= SIDES, "Invalid guess");

        result = _generateRoll(msg.sender);
        win = (guess == result);

        totalRolls++;
        if (win) {
            totalWins++;
        }

        userStats[msg.sender].rolls++;
        if (win) {
            userStats[msg.sender].wins++;
        }
        userStats[msg.sender].lastRoll = block.number;
        userStats[msg.sender].lastResult = result;

        emit DiceRolled(msg.sender, guess, result, win);
    }

    function getUserStats(address user) external view returns (
        uint256 rolls,
        uint256 wins,
        uint256 lastRoll,
        uint256 lastResult
    ) {
        UserStats memory stats = userStats[user];
        return (stats.rolls, stats.wins, stats.lastRoll, stats.lastResult);
    }

    function isGameActive() external view returns (bool) {
        return !gamePaused;
    }

    function setGamePaused(bool _paused) external onlyOwner {
        gamePaused = _paused;
        emit GamePaused(_paused);
    }

    function _generateRoll(address player) private view returns (uint256) {
        uint256 hash = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            player,
            totalRolls,
            block.timestamp
        )));
        return (hash % SIDES) + 1;
    }
}
