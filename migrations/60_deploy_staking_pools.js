/**
 * Creation of the LP Token Staking pools for the supported pairs
 */
const {getContract, getSwapFactory, getPoolStaker} = require('./external-contracts');
const {
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
    TEST_TREASURY_ACCOUNT,
} = require('./migration-config');
const {BSC_NETWORKS, LIQUIDITY_FEE} = require('../deploy.config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const swapFactory = await getSwapFactory(network);
    const poolStaker = await getPoolStaker(network);
    const antToken = await AntToken.deployed();

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    console.log(`PoolStaker at ${poolStaker.address}`);
    for (let pool of initialDeploymentPools) {
        const otherToken = await getContract(pool.otherToken, network);
        const poolContract = artifacts.require(pool.contractName);

        console.log(`Deploying staking pool for the ANT/${pool.otherToken} pair`);
        const poolAddress = await swapFactory.getPool(antToken.address, otherToken.address, LIQUIDITY_FEE);

        await deployer.deploy(poolContract, poolStaker.address, poolAddress, antToken.address, TEST_TREASURY_ACCOUNT);
    }
};
