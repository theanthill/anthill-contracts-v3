/**
 * Allocation of Ant Tokens for Rewards Distributor and initial distribution, only for Testnet.
 * On the Mainnet the allocation will be done by the Treasury account
 */
const BigNumber = require('bignumber.js');

const {MAIN_NETWORKS, BSC_NETWORKS} = require('../deploy.config.js');
const {getPoolStaker} = require('./external-contracts.js');
const {
    TEST_REWARD_PER_STAKING_POOL,
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
} = require('./migration-config');
const {getDisplayBalance} = require('./helper_functions');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    // Test only
    if (network.includes(MAIN_NETWORKS)) {
        return;
    }

    const antToken = await AntToken.deployed();
    const PoolStaker = await getPoolStaker(network);
    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    const unit = BigNumber(10 ** 18);
    const rewardPerPool = unit.times(TEST_REWARD_PER_STAKING_POOL);
    const totalReward = rewardPerPool.times(initialDeploymentPools.length);

    for (let pool of initialDeploymentPools) {
        const poolContract = artifacts.require(pool.contractName);
        const deployedPool = await poolContract.deployed();

        console.log(`Minting ${getDisplayBalance(rewardPerPool)} ANT Tokens for rewards`);
        await antToken.mint(deployedPool.address, rewardPerPool);

        console.log(
            `Creating incentive of ${getDisplayBalance(rewardPerPool)} ANT tokens for ${pool.contractName} pool`
        );
        await deployedPool.createIncentive(rewardPerPool);
    }
};
