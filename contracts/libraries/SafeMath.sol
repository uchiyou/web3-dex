// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeMath
 * @notice Library for safe arithmetic operations to prevent overflow/underflow
 */
library SafeMath {
    /**
     * @notice Add two numbers safely
     * @param a First operand
     * @param b Second operand
     * @return Result of a + b
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    /**
     * @notice Subtract two numbers safely
     * @param a First operand
     * @param b Second operand
     * @return Result of a - b
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }

    /**
     * @notice Multiply two numbers safely
     * @param a First operand
     * @param b Second operand
     * @return Result of a * b
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    /**
     * @notice Divide two numbers safely
     * @param a First operand
     * @param b Second operand
     * @return Result of a / b
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }

    /**
     * @notice Modulo operation safely
     * @param a First operand
     * @param b Second operand
     * @return Result of a % b
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: modulo by zero");
        return a % b;
    }

    /**
     * @notice Calculate square root using Newton method
     * @param x Input number
     * @return y Square root
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @notice Calculate floor of binary logarithm
     * @param x Input number
     * @return y Floor of log2(x)
     */
    function log2(uint256 x) internal pure returns (uint256 y) {
        require(x > 0, "SafeMath: log of zero");
        y = 0;
        while (x > 1) {
            x >>= 1;
            y++;
        }
    }
}

/**
 * @title MathUtils
 * @notice Additional math utilities
 */
library MathUtils {
    /**
     * @notice Calculate percentage of a value
     * @param value The base value
     * @param basisPoints The percentage in basis points (10000 = 100%)
     * @return Result of the percentage calculation
     */
    function percentage(uint256 value, uint256 basisPoints) internal pure returns (uint256) {
        return SafeMath.mul(value, basisPoints) / 10000;
    }

    /**
     * @notice Clamp a value between min and max
     * @param value The value to clamp
     * @param min Minimum bound
     * @param max Maximum bound
     * @return Clamped value
     */
    function clamp(uint256 value, uint256 min, uint256 max) internal pure returns (uint256) {
        require(min <= max, "MathUtils: invalid clamp bounds");
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    /**
     * @notice Check if two values are approximately equal
     * @param a First value
     * @param b Second value
     * @param maxDelta Maximum allowed difference
     * @return True if values are approximately equal
     */
    function approximatelyEqual(
        uint256 a, 
        uint256 b, 
        uint256 maxDelta
    ) internal pure returns (bool) {
        return a > b ? a - b <= maxDelta : b - a <= maxDelta;
    }
}
