/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const {
    getTokenContract,
    getSwapFactory,
    getSwapRouter,
    getPositionManager,
    getPoolStaker,
} = require('./external-contracts');
const {encodeSqrtRatioX96} = require('./helper_functions');
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

    const priceLower = encodeSqrtRatioX96(1.0, 1.0); // TODO
    const priceUpper = encodeSqrtRatioX96(1.0, 1.0); // TODO

    for (let pool of initialDeploymentPools) {
        const PoolContract = artifacts.require(pool.contractName);
        const HelperContract = artifacts.require(pool.helperContract);

        const otherToken = await getTokenContract(pool.otherToken, network);
        const poolContract = await PoolContract.deployed();

        console.log(`Deploying liquidity helper for pair ANT/${pool.otherToken}`);
        const liquidityHelper = await deployer.deploy(
            HelperContract,
            antToken.address,
            otherToken.address,
            priceLower,
            priceUpper,
            LIQUIDITY_FEE,
            positionManager.address,
            poolStaker.address,
            poolContract.address
        );

        console.log(`Assigning liquidity helper as ANT/${pool.otherToken} staking pool operator`);
        await poolContract.transferOperator(liquidityHelper.address);
    }
};
