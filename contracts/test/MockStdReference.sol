// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

import "../interfaces/IStdReference.sol";

contract MockStdReference is IStdReference {
    uint256 public testRate = 1e18;

    bytes32 public encodedANT;
    bytes32 public encodedETH;
    bytes32 public encodedUSDC;

    constructor() {
        encodedANT = keccak256(abi.encodePacked("ANT"));
        encodedETH = keccak256(abi.encodePacked("ETH"));
        encodedUSDC = keccak256(abi.encodePacked("USDC"));
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(
        string memory _base,
        string memory /*_quote*/
    ) public view override returns (ReferenceData memory) {
        ReferenceData memory data;

        bytes32 encodedBase = keccak256(abi.encodePacked(_base));

        if (encodedBase == encodedANT) {
            data.rate = testRate;
            data.lastUpdatedBase = 0;
            data.lastUpdatedQuote = 0;
        } else if (encodedBase == encodedETH) {
            data.rate = 1500 * 1e18;
            data.lastUpdatedBase = 0;
            data.lastUpdatedQuote = 0;
        } else if (encodedBase == encodedUSDC) {
            data.rate = 1e18;
            data.lastUpdatedBase = 0;
            data.lastUpdatedQuote = 0;
        } else {
            data.rate = 1e18;
            data.lastUpdatedBase = 0;
            data.lastUpdatedQuote = 0;
        }

        return data;
    }

    /// Similar to getReferenceData, but with multiple base/quote pairs at once.
    function getReferenceDataBulk(string[] memory _bases, string[] memory _quotes)
        external
        view
        override
        returns (ReferenceData[] memory)
    {
        ReferenceData[] memory data = new ReferenceData[](_bases.length);

        for (uint256 i = 0; i < data.length; ++i) {
            data[i] = getReferenceData(_bases[i], _quotes[i]);
        }

        return data;
    }

    function setTestRate(uint256 rate) external {
        testRate = rate;
    }
}
