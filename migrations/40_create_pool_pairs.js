/**
 * Creates the pairs contracts for the liquidity pools. This is needed because the Oracle will need
 * the pair contract already existing when its constructor is executed
 */
const {BigNumber} = require('bignumber.js');

const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS, LIQUIDITY_FEE} = require('../deploy.config');
const {getTokenContract, getSwapFactory} = require('./external-contracts');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const UniswapPool = artifacts.require('IUniswapV3Pool');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const swapFactory = await getSwapFactory(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const otherToken = await getTokenContract(pool.otherToken, network);

        console.log(`Creating swap pool for the ANT/${pool.otherToken} liquidity`);
        await swapFactory.createPool(antToken.address, otherToken.address, LIQUIDITY_FEE);

        const poolAddress = await swapFactory.getPool(antToken.address, otherToken.address, LIQUIDITY_FEE);
        await console.log(`  - Pool created at address ${poolAddress}`);

        const uniswapPool = await UniswapPool.at(poolAddress);

        const sqrtPriceX96 = encodeSqrtRatioX96(1.0, 1.0);
        await uniswapPool.initialize(sqrtPriceX96);
    }
}

function encodeSqrtRatioX96(amount1, amount0) {
    const shiftAmount = BigNumber(2).pow(192);
    const numerator = BigNumber(amount1).times(shiftAmount);
    const denominator = BigNumber(amount0);
    const ratioX192 = numerator.div(denominator);
    return ratioX192.sqrt();
}

module.exports = migration;
