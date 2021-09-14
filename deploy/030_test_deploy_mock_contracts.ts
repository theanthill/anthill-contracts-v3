/**
 * Deploy Mock contract for testing
 */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { MAIN_NETWORKS } from "../deploy.config";
import {
    TEST_INITIAL_BUSD_SUPPLY,
    TEST_INITIAL_ETH_SUPPLY,
    TEST_FAUCET_MAX_REFILL,
    TEST_FAUCET_INITIAL_ALLOCATION,
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    TEST_HQ_ACCOUNT,
} from "../config";

import { BigNumber } from "@ethersproject/bignumber";

import { MockETH, MockBUSD, AntToken } from "../typechain";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;
    const network = hre.network.name;
    const ethers = hre.ethers;

    if (MAIN_NETWORKS.includes(network)) {
        return;
    }

    console.log("[TEST: Deploy mockup contracts]");
    const unit = BigNumber.from(10).pow(18);

    // BUSD
    console.log("  - Deploy MockBUSD");
    const busdInitialAllocation = unit.mul(TEST_INITIAL_BUSD_SUPPLY);
    await deploy("MockBUSD", {
        from: deployer,
        log: true,
    });
    const mockBUSD = (await ethers.getContract("MockBUSD")) as MockBUSD;
    await mockBUSD.mint(deployer, busdInitialAllocation).then(tx => tx.wait());

    tags.push("MockBUSD");

    // ETH
    console.log("  - Deploy MockETH");
    await deploy("MockETH", {
        from: deployer,
        log: true,
    });

    const ethInitialAllocation = unit.mul(TEST_INITIAL_ETH_SUPPLY);
    const mockETH = (await ethers.getContract("MockBUSD")) as MockETH;

    await mockETH.mint(deployer, ethInitialAllocation).then(tx => tx.wait());

    tags.push("MockETH");

    // Faucet
    console.log("  - Deploy TokenFaucet");
    const faucetMaxRefill = BigNumber.from(10).pow(18).mul(TEST_FAUCET_MAX_REFILL);
    const faucetInitialAllocation = BigNumber.from(10).pow(18).mul(TEST_FAUCET_INITIAL_ALLOCATION);

    const antToken = (await ethers.getContract("AntToken")) as AntToken;

    const tokenFaucet = await deploy("TokenFaucet", {
        from: deployer,
        log: true,
        args: [
            antToken.address,
            mockBUSD.address,
            mockETH.address,
            faucetMaxRefill,
            [TEST_TREASURY_ACCOUNT, TEST_OPERATOR_ACCOUNT, TEST_ADMIN_ACCOUNT, TEST_HQ_ACCOUNT],
        ],
    });

    await antToken.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());
    await mockBUSD.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());
    await mockETH.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());

    tags.push("TokenFaucet");

    // MockStdReference
    console.log("  - Deploy MockStdReference");
    await deploy("MockStdReference", {
        from: deployer,
        log: true,
    });

    tags.push("MockETH");
};

deployStep.tags = tags;

export default deployStep;
