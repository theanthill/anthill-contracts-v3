/**
 * Deploys all governance contracts
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { TREASURY_ACCOUNT, OPERATOR_ACCOUNT, TEST_TREASURY_ACCOUNT, TEST_OPERATOR_ACCOUNT } from "../config";
import {
    ORACLE_START_DATE,
    TREASURY_START_DATE,
    MAIN_NETWORKS,
    ORACLE_PERIOD,
    TREASURY_PERIOD,
    TREASURY_TIMELOCK_PERIOD,
    OPERATOR_TIMELOCK_PERIOD,
    LIQUIDITY_FEE,
} from "../deploy.config";

import { AntBond, AntShare, AntToken, IUniswapV3Factory, MockUSDC, MockStdReference } from "../typechain";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const ethers = hre.ethers;
    const { deploy } = hre.deployments;
    const network = hre.network.name;

    console.log("[Deploy Governance contracts]");

    const antToken = (await ethers.getContract("AntToken")) as AntToken;
    const antBond = (await ethers.getContract("AntBond")) as AntBond;
    const antShare = (await ethers.getContract("AntShare")) as AntShare;
    const swapFactory = (await ethers.getContract("IUniswapV3Factory")) as IUniswapV3Factory;
    const bandOracle = (await ethers.getContract("MockStdReference")) as MockStdReference;
    const mockUSDC = (await ethers.getContract("MockUSDC")) as MockUSDC;

    // Get the ANT/BUUSDCSD pair
    const ANTUSDCPoolAddress = await swapFactory.getPool(antToken.address, mockUSDC.address, LIQUIDITY_FEE);

    // Deploy all governance contracts
    console.log("  - Deploy Boardroom");
    const boardroom = await deploy("Boardroom", {
        from: deployer,
        log: true,
        args: [antToken.address, antShare.address],
    });

    console.log("  - Deploy Oracle");
    const oracle = await deploy("Oracle", {
        from: deployer,
        log: true,
        args: [ANTUSDCPoolAddress, ORACLE_PERIOD, ORACLE_START_DATE, bandOracle.address],
    });

    console.log("  - Deploy ContributionPool");
    const contributionPool = await deploy("ContributionPool", {
        from: deployer,
        log: true,
    });

    // Deploy Treasury to bind them all
    console.log("  - Deploy Treasury");
    await deploy("Treasury", {
        from: deployer,
        log: true,
        args: [
            antToken.address,
            antBond.address,
            antShare.address,
            oracle.address,
            boardroom.address,
            contributionPool.address,
            TREASURY_START_DATE,
            TREASURY_PERIOD,
        ],
    });

    // Timelocks
    let adminAccount = MAIN_NETWORKS.includes(network) ? TREASURY_ACCOUNT : TEST_TREASURY_ACCOUNT;

    console.log(`  - Deploy TreasuryTimelock for account Treasury (${adminAccount}) as both proposer and executor`);
    await deploy("TreasuryTimelock", {
        from: deployer,
        log: true,
        args: [TREASURY_TIMELOCK_PERIOD, [adminAccount]],
    });

    adminAccount = MAIN_NETWORKS.includes(network) ? OPERATOR_ACCOUNT : TEST_OPERATOR_ACCOUNT;
    console.log(`  - Deploy OperatorTimelock for account Treasury (${adminAccount}) as both proposer and executor`);
    await deploy("OperatorTimelock", {
        from: deployer,
        log: true,
        args: [OPERATOR_TIMELOCK_PERIOD, [adminAccount]],
    });
};

deployStep.tags = tags;

export default deployStep;
