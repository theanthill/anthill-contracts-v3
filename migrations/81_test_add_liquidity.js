/**
 * Add liquidity to PancakeSwap only if we are on the Testnet. On the Mainnet the liquidity
 * will be added manually by HQ
 */
const BigNumber = require('bignumber.js');

const {MAIN_NETWORKS, LIQUIDITY_FEE} = require('../deploy.config.js');
const {
    TEST_ANT_LIQUIDITY_PER_POOL,
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');
const {getTokenContract, getBandOracle, getPositionManager} = require('./external-contracts');
const {getDisplayBalance} = require('./helper_functions');

// ============ Contracts ============
const Oracle = artifacts.require('Oracle');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    // Test only
    if (network.includes(MAIN_NETWORKS)) {
        return;
    }

    const bandOracle = await getBandOracle(network);
    const positionManager = await getPositionManager(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        console.log(`Liquidity for the ${pool.mainToken}/${pool.otherToken} staking pool`);
        await addLiquidity(network, accounts[0], pool, positionManager, bandOracle, TEST_ANT_LIQUIDITY_PER_POOL);
    }
}

// ============ Helper Functions ============
async function addLiquidity(network, account, pool, positionManager, oracle, initialAllocation) {
    const mainToken = await getTokenContract(pool.mainToken, network);
    const otherToken = await getTokenContract(pool.otherToken, network);

    // Get the price rate
    const otherTokenRate = await oracle.getReferenceData(pool.otherToken, 'BUSD');
    const priceOtherToken = BigNumber(otherTokenRate.rate);

    const unit = BigNumber(10 ** 18);

    let mainTokenAmount = unit.times(initialAllocation);
    let otherTokenAmount = unit.times(initialAllocation).times(unit).idiv(priceOtherToken);

    const LiquidityHelper = artifacts.require(pool.helperContract);
    const liquidityHelper = await LiquidityHelper.deployed();

    // Mint some tokens for the liquidity helper
    console.log(`Minting ${getDisplayBalance(mainTokenAmount)} for ${pool.mainToken}`);
    console.log(`Minting ${getDisplayBalance(otherTokenAmount)} for ${pool.otherToken}`);
    await mainToken.mint(account, mainTokenAmount);
    await otherToken.mint(account, otherTokenAmount);
    await Promise.all([
        approveIfNot(mainToken, account, liquidityHelper.address, mainTokenAmount),
        approveIfNot(otherToken, account, liquidityHelper.address, otherTokenAmount),
    ]);

    console.log(
        `  - Adding liquidity for the ${pool.mainToken}/${pool.otherToken} pool (${getDisplayBalance(
            mainTokenAmount
        )}/${getDisplayBalance(otherTokenAmount)})`
    );
    await liquidityHelper.addLiquidityAndStake(mainTokenAmount, otherTokenAmount, 0, 0, deadline());

    /*const tokenId = await liquidityHelper.tokenId();
    const liquidity = await liquidityHelper.liquidity();
    const amount0 = await liquidityHelper.amount0();
    const amount1 = await liquidityHelper.amount1();

    console.log(
        `tokenId: ${tokenId.toString()}, liquidity: ${getDisplayBalance(BigNumber(liquidity))}, 
        amount0: ${getDisplayBalance(BigNumber(amount0))}, amount1: ${getDisplayBalance(BigNumber(amount1))}`
    );*/
}

async function approveIfNot(token, owner, spender, amount) {
    const allowance = await token.allowance(owner, spender);
    if (BigNumber(allowance).gte(BigNumber(amount))) {
        return;
    }
    await token.approve(spender, amount);
    console.log(
        `    - Approved ${token.symbol ? await token.symbol() : token.address} for ${getDisplayBalance(amount)} tokens`
    );
}

function deadline() {
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

module.exports = migration;
