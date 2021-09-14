/**
 * Creates the pairs contracts for the liquidity pools. This is needed because the Oracle will need
 * the pair contract already existing when its constructor is executed
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { INITIAL_ETH_DEPLOYMENT_POOLS } from "../config";
import { LIQUIDITY_FEE } from "../deploy.config";
import { encodeSqrtRatioX96 } from "../utils/helperFunctions";

import { AntToken, IUniswapV3Factory, IUniswapV3Pool } from "../typechain";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const deployments = await hre.deployments.all();

    console.log("[Create and initialize UniswapV3 pools]");

    const antToken = (await ethers.getContract("AntToken")) as AntToken;
    const swapFactory = (await ethers.getContract("IUniswapV3Factory")) as IUniswapV3Factory;
    const uniswapPool = deployments["IUniswapV3Pool"];

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;

    for (const poolConfig of initialDeploymentPools) {
        const otherToken = await ethers.getContract(poolConfig.otherToken);

        console.log(`  - Creating swap pool for the ANT/${poolConfig.otherToken} liquidity`);
        await swapFactory.createPool(antToken.address, otherToken.address, LIQUIDITY_FEE).then(tx => tx.wait());

        const poolAddress = await swapFactory.getPool(antToken.address, otherToken.address, LIQUIDITY_FEE);
        await console.log(`    - Pool created at address ${poolAddress}`);

        const pool = (await ethers.getContractAt(uniswapPool.abi, poolAddress)) as IUniswapV3Pool;

        console.log(`    - Initialize pool`);
        const sqrtPriceX96 = encodeSqrtRatioX96(1, 1);
        await pool.initialize(String(sqrtPriceX96)).then(tx => tx.wait());
        await pool.increaseObservationCardinalityNext(16).then(tx => tx.wait());
    }
};

deployStep.tags = tags;

export default deployStep;
