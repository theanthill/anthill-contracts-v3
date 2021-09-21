/**
 * Deploy Mock contract for testing
 */

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { MAIN_NETWORKS } from "../deploy.config";
import {
    TEST_INITIAL_USDC_SUPPLY,
    TEST_INITIAL_ETH_SUPPLY,
    TEST_FAUCET_MAX_REFILL,
    TEST_FAUCET_INITIAL_ALLOCATION,
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    TEST_HQ_ACCOUNT,
} from "../config";

import { BigNumber } from "@ethersproject/bignumber";

import { MockETH, MockUSDC, AntToken, MockStdReference } from "../typechain";

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

    // USDC
    console.log("  - Deploy MockUSDC");
    const busdInitialAllocation = unit.mul(TEST_INITIAL_USDC_SUPPLY);
    await deploy("MockUSDC", {
        from: deployer,
        log: true,
    });
    const mockUSDC = (await ethers.getContract("MockUSDC")) as MockUSDC;
    await mockUSDC.mint(deployer, busdInitialAllocation).then(tx => tx.wait());

    tags.push("MockUSDC");

    // ETH
    console.log("  - Deploy MockETH");
    await deploy("MockETH", {
        from: deployer,
        log: true,
    });

    const ethInitialAllocation = unit.mul(TEST_INITIAL_ETH_SUPPLY);
    const mockETH = (await ethers.getContract("MockETH")) as MockETH;

    await mockETH.mint(deployer, ethInitialAllocation).then(tx => tx.wait());

    tags.push("MockETH");

    // MockStdReference
    console.log("  - Deploy MockStdReference");
    await deploy("MockStdReference", {
        from: deployer,
        log: true,
    });

    const mockStdReference = (await ethers.getContract("MockStdReference")) as MockStdReference;

    tags.push("MockStdReference");

    // Faucet
    console.log("  - Deploy TokenFaucet");
    const faucetInitialAllocation = BigNumber.from(10).pow(18).mul(TEST_FAUCET_INITIAL_ALLOCATION);

    const antToken = (await ethers.getContract("AntToken")) as AntToken;

    const antTokenRate = await mockStdReference.getReferenceData(await antToken.symbol(), "USDC");
    const USDCRate = await mockStdReference.getReferenceData(await mockUSDC.symbol(), "USDC");
    const ETHRate = await mockStdReference.getReferenceData(await mockETH.symbol(), "USDC");

    const faucetMaxRefill0 = BigNumber.from(10).pow(36).mul(TEST_FAUCET_MAX_REFILL).div(antTokenRate.rate);
    const faucetMaxRefill1 = BigNumber.from(10).pow(36).mul(TEST_FAUCET_MAX_REFILL).div(USDCRate.rate);
    const faucetMaxRefill2 = BigNumber.from(10).pow(36).mul(TEST_FAUCET_MAX_REFILL).div(ETHRate.rate);

    const tokenFaucet = await deploy("TokenFaucet", {
        from: deployer,
        log: true,
        args: [
            antToken.address,
            mockUSDC.address,
            mockETH.address,
            faucetMaxRefill0,
            faucetMaxRefill1,
            faucetMaxRefill2,
            [TEST_TREASURY_ACCOUNT, TEST_OPERATOR_ACCOUNT, TEST_ADMIN_ACCOUNT, TEST_HQ_ACCOUNT],
        ],
    });

    await antToken.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());
    await mockUSDC.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());
    await mockETH.mint(tokenFaucet.address, faucetInitialAllocation).then(tx => tx.wait());

    tags.push("TokenFaucet");
};

deployStep.tags = tags;

export default deployStep;
