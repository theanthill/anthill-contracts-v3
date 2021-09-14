/**
 * Initial allocation of Ant Token and Ant Shares
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

import {
    TREASURY_ACCOUNT,
    TREASURY_ANT_ALLOCATION,
    MAX_ANTS_SUPPLY,
    TEST_TREASURY_ACCOUNT,
    TEST_HQ_ACCOUNT,
    TEST_HQ_ANT_ALLOCATION,
    TEST_HQ_ANTS_ALLOCATION,
} from "../config";

import { MAIN_NETWORKS } from "../deploy.config";

import { AntShare, AntToken } from "../typechain";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const network = hre.network.name;

    console.log("[Mint initial tokens allocations]");

    const antToken = (await ethers.getContract("AntToken")) as AntToken;
    const antShare = (await ethers.getContract("AntShare")) as AntShare;

    const unit = BigNumber.from(10).pow(18);

    // Mainnet
    if (MAIN_NETWORKS.includes(network)) {
        console.log(`  - Using Mainnet configuration`);
        const treasuryANTAllocation = unit.mul(TREASURY_ANT_ALLOCATION);
        const treasuryANTSAllocation = unit.mul(MAX_ANTS_SUPPLY);

        console.log("    - Minting " + TREASURY_ANT_ALLOCATION + " Ant Tokens to Treasury Account");
        await antToken.mint(TREASURY_ACCOUNT, treasuryANTAllocation).then(tx => tx.wait());

        console.log("    - Minting " + MAX_ANTS_SUPPLY + " Ant Shares to Treasury Account");
        await antShare.mint(TREASURY_ACCOUNT, treasuryANTSAllocation).then(tx => tx.wait());
    } // Testnet
    else {
        console.log(`  - Using Testnet configuration`);
        const ANTAllocation = TREASURY_ANT_ALLOCATION - TEST_HQ_ANT_ALLOCATION;
        const ANTSAllocation = MAX_ANTS_SUPPLY - TEST_HQ_ANTS_ALLOCATION;

        const treasuryANTAllocation = unit.mul(ANTAllocation);
        const treasuryANTSAllocation = unit.mul(ANTSAllocation);

        console.log("    - Minting " + ANTAllocation + " Ant Tokens to Treasury Account");
        await antToken.mint(TEST_TREASURY_ACCOUNT, treasuryANTAllocation).then(tx => tx.wait());

        console.log("    - Minting " + ANTSAllocation + " Ant Shares to Treasury Account");
        await antShare.mint(TEST_TREASURY_ACCOUNT, treasuryANTSAllocation).then(tx => tx.wait());

        const HQANTSAllocation = unit.mul(TEST_HQ_ANTS_ALLOCATION);

        // There is no allocation of Ant Token for the test HQ account as it will be
        // directly used to provide liquidity
        console.log("    - Minting " + TEST_HQ_ANTS_ALLOCATION + " Ant Shares to test HQ Account");
        await antShare.mint(TEST_HQ_ACCOUNT, HQANTSAllocation).then(tx => tx.wait());
    }
};

deployStep.tags = tags;

export default deployStep;
