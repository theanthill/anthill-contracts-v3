/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {INITIAL_ETH_DEPLOYMENT_POOLS} from '../config';
import {LIQUIDITY_FEE} from '../deploy.config';

import {AntToken, INonfungiblePositionManager, IUniswapV3Staker} from '../typechain';
import {encodeSqrtRatioX96, nearestUsableTick, TICK_SPACINGS} from '../utils/helperFunctions';
import {TickMath} from '../utils/TickMath';

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployer} = await hre.getNamedAccounts();
    const ethers = hre.ethers;
    const {deploy} = hre.deployments;

    console.log('[Deploy LiquidityHelper contracts]');

    const antToken = (await ethers.getContract('AntToken')) as AntToken;
    const positionManager = (await ethers.getContract('INonfungiblePositionManager')) as INonfungiblePositionManager;
    const poolStaker = (await ethers.getContract('IUniswapV3Staker')) as IUniswapV3Staker;

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;

    for (const poolConfig of initialDeploymentPools) {
        const otherToken = await ethers.getContract(poolConfig.otherToken);
        const poolContract = await ethers.getContract(poolConfig.contractName);

        let priceLower, priceUpper;
        let token0, token1;
        if (antToken.address < otherToken.address) {
            token0 = antToken;
            token1 = otherToken;

            priceLower = encodeSqrtRatioX96(9, 10);
            priceUpper = encodeSqrtRatioX96(11, 10);
        } else {
            token0 = otherToken;
            token1 = antToken;

            priceLower = encodeSqrtRatioX96(10, 11);
            priceUpper = encodeSqrtRatioX96(10, 9);
        }

        let tickLower = TickMath.getTickAtSqrtRatio(priceLower);
        let tickUpper = TickMath.getTickAtSqrtRatio(priceUpper);

        tickLower = nearestUsableTick(tickLower, TICK_SPACINGS[LIQUIDITY_FEE]);
        tickUpper = nearestUsableTick(tickUpper, TICK_SPACINGS[LIQUIDITY_FEE]);

        console.log(`  - Deploy liquidity helper for pair ANT/${poolConfig.otherToken}`);
        console.log(`    - Price Lower: ${priceLower}, Price Upper: ${priceUpper}`);
        console.log(`    - Tick Lower: ${tickLower}, Tick Upper: ${tickUpper}`);
        const liquidityHelper = await deploy(poolConfig.helperContract, {
            from: deployer,
            log: true,
            args: [
                token0.address,
                token1.address,
                tickLower,
                tickUpper,
                LIQUIDITY_FEE,
                positionManager.address,
                poolStaker.address,
                poolContract.address,
            ],
        });

        console.log(`    - Assigning liquidity helper as ANT/${poolConfig.otherToken} staking pool operator`);
        await poolContract.transferOperator(liquidityHelper.address);
    }
};

deployStep.tags = tags;

export default deployStep;
