/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const JSBI = require('jsbi');

const {getContract, getPositionManager, getPoolStaker} = require('./external-contracts');
const {encodeSqrtRatioX96, nearestUsableTick, TICK_SPACINGS} = require('../utils/helperFunctions');

const {getTickAtSqrtRatio} = require('../utils/TickMath');

const {
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
    PRICE_LOWER,
    PRICE_UPPER,
} = require('./migration-config');

const {BSC_NETWORKS, LIQUIDITY_FEE} = require('../deploy.config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();

    const positionManager = await getPositionManager(network);
    const poolStaker = await getPoolStaker(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const PoolContract = artifacts.require(pool.contractName);
        const HelperContract = artifacts.require(pool.helperContract);

        const otherToken = await getContract(pool.otherToken, network);
        const poolContract = await PoolContract.deployed();

        let priceLower, priceUpper;
        let token0, token1;
        if (antToken.address < otherToken.address) {
            console.log('Case 1');
            token0 = antToken;
            token1 = otherToken;

            priceLower = encodeSqrtRatioX96(9, 10);
            priceUpper = encodeSqrtRatioX96(11, 10);
        } else {
            console.log('Case 2');
            token0 = otherToken;
            token1 = antToken;

            priceLower = encodeSqrtRatioX96(10, 11);
            priceUpper = encodeSqrtRatioX96(10, 9);
        }

        let tickLower = getTickAtSqrtRatio(priceLower);
        let tickUpper = getTickAtSqrtRatio(priceUpper);

        tickLower = nearestUsableTick(tickLower, TICK_SPACINGS[LIQUIDITY_FEE]);
        tickUpper = nearestUsableTick(tickUpper, TICK_SPACINGS[LIQUIDITY_FEE]);

        console.log(`Price Lower: ${priceLower}, Tick Lower: ${tickLower}`);
        console.log(`Price Upper: ${priceUpper}, Tick Upper: ${tickUpper}`);

        console.log(`Deploying liquidity helper for pair ANT/${pool.otherToken}`);
        console.log(`Price Lower: ${priceLower}, Price Upper: ${priceUpper}`);

        const liquidityHelper = await deployer.deploy(
            HelperContract,
            token0.address,
            token1.address,
            tickLower,
            tickUpper,
            LIQUIDITY_FEE,
            positionManager.address,
            poolStaker.address,
            poolContract.address
        );

        console.log(`Assigning liquidity helper as ANT/${pool.otherToken} staking pool operator`);
        await poolContract.transferOperator(liquidityHelper.address);
    }
};
