/**
 * Creates the pairs contracts for the liquidity pools. This is needed because the Oracle will need
 * the pair contract already existing when its constructor is executed
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import JSBI from "jsbi";

import { INITIAL_ETH_DEPLOYMENT_POOLS } from "../config";
import { LIQUIDITY_FEE } from "../deploy.config";
import { encodeSqrtRatioX96 } from "../utils/helperFunctions";

import { AntToken, BaseToken, IUniswapV3Factory, IUniswapV3Pool, MockStdReference } from "../typechain";
import { TickMath } from "../utils/TickMath";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const deployments = await hre.deployments.all();

    console.log("[Create and initialize UniswapV3 pools]");

    const antToken = (await ethers.getContract("AntToken")) as AntToken;
    const swapFactory = (await ethers.getContract("IUniswapV3Factory")) as IUniswapV3Factory;
    const bandOracle = (await ethers.getContract("MockStdReference")) as MockStdReference;
    const uniswapPool = deployments["IUniswapV3Pool"];

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;

    for (const poolConfig of initialDeploymentPools) {
        const otherToken = (await ethers.getContract(poolConfig.otherToken)) as BaseToken;

        console.log(`  - Creating swap pool for the ANT/${poolConfig.otherToken} liquidity`);
        await swapFactory.createPool(antToken.address, otherToken.address, LIQUIDITY_FEE).then(tx => tx.wait());

        const poolAddress = await swapFactory.getPool(antToken.address, otherToken.address, LIQUIDITY_FEE);
        await console.log(`    - Pool created at address ${poolAddress}`);

        const pool = (await ethers.getContractAt(uniswapPool.abi, poolAddress)) as IUniswapV3Pool;

        console.log(`    - Initialize pool`);
        const otherTokenSymbol = await otherToken.symbol();
        const otherTokenRate = await bandOracle.getReferenceData(otherTokenSymbol, "USDC");
        const priceAntToken = JSBI.BigInt(10 ** 18);
        const priceOtherToken = JSBI.BigInt(otherTokenRate.rate);

        let sqrtPriceX96;
        if (antToken.address < otherToken.address) {
            console.log(`OP1 Ant Price: ${priceAntToken.toString()}, Other Price: ${priceOtherToken.toString()}`);
            sqrtPriceX96 = encodeSqrtRatioX96(priceAntToken, priceOtherToken);
        } else {
            console.log(`OP2 Ant Price: ${priceAntToken.toString()}, Other Price: ${priceOtherToken.toString()}`);
            sqrtPriceX96 = encodeSqrtRatioX96(priceOtherToken, priceAntToken);
        }

        const tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);

        console.log(`Tick ${tick} for ${poolConfig.contractName}`);
        console.log(`Price ${sqrtPriceX96} for ${poolConfig.contractName}`);

        await pool.initialize(sqrtPriceX96.toString()).then(tx => tx.wait());
        await pool.increaseObservationCardinalityNext(16).then(tx => tx.wait());
    }
};

deployStep.tags = tags;

export default deployStep;
