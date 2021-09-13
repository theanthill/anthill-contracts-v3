/**
 * Add liquidity to PancakeSwap only if we are on the Testnet. On the Mainnet the liquidity
 * will be added manually by HQ
 */
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {BigNumber} from 'ethers';

import {TEST_ANT_LIQUIDITY_PER_POOL, INITIAL_ETH_DEPLOYMENT_POOLS} from '../config';
import {MAIN_NETWORKS} from '../deploy.config';

import {BaseToken, LiquidityStakingHelper, MockStdReference} from '../typechain';
import {getDisplayBalance} from '../utils/helperFunctions';
import {HardhatEthersHelpers} from 'hardhat-deploy-ethers/dist/src/types';

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const network = hre.network.name;
    const {deployer} = await hre.getNamedAccounts();

    // Test only
    if (MAIN_NETWORKS.includes(network)) {
        return;
    }

    console.log('[TEST: Adding liquidity to UniswapV3 pools]');
    const bandOracle = (await ethers.getContract('MockStdReference')) as MockStdReference;

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;
    const liquidityPerPool = BigNumber.from(TEST_ANT_LIQUIDITY_PER_POOL);

    for (const poolConfig of initialDeploymentPools) {
        await addLiquidity(ethers, deployer, poolConfig, bandOracle, liquidityPerPool);
    }
};

// ============ Helper Functions ============
async function addLiquidity(
    ethers: HardhatEthersHelpers,
    account: string,
    poolConfig: any,
    oracle: MockStdReference,
    initialAllocation: BigNumber
) {
    console.log(`  - Adding liquidity for the ${poolConfig.mainToken}/${poolConfig.otherToken} pool`);
    const mainToken = await ethers.getContract(poolConfig.mainToken);
    const otherToken = await ethers.getContract(poolConfig.otherToken);

    // Get the price rate
    const otherTokenRate = await oracle.getReferenceData(poolConfig.otherToken, 'BUSD');
    const priceOtherToken = BigNumber.from(otherTokenRate.rate);

    const unit = BigNumber.from(10).pow(18);

    const mainTokenAmount = unit.mul(initialAllocation);
    const otherTokenAmount = unit.mul(initialAllocation).mul(unit).div(priceOtherToken);

    const liquidityHelper = (await ethers.getContract(poolConfig.helperContract)) as LiquidityStakingHelper;

    // Mint some tokens for the liquidity helper
    console.log(`    - Minting ${getDisplayBalance(mainTokenAmount)} for ${poolConfig.mainToken}`);
    await mainToken.mint(account, mainTokenAmount);

    console.log(`    - Minting ${getDisplayBalance(otherTokenAmount)} for ${poolConfig.otherToken}`);
    await otherToken.mint(account, otherTokenAmount);

    console.log(`    - Approve ${account} as spender for tokens`);
    await Promise.all([
        approveIfNot(mainToken as BaseToken, account, liquidityHelper.address, mainTokenAmount),
        approveIfNot(otherToken as BaseToken, account, liquidityHelper.address, otherTokenAmount),
    ]);

    // TODO: Do not create the liquidity now, it will be done manually later
    /*console.log(
        `  - Adding liquidity for the ${pool.mainToken}/${pool.otherToken} pool (${getDisplayBalance(
            mainTokenAmount
        )}/${getDisplayBalance(otherTokenAmount)})`
    );
    await liquidityHelper.addLiquidityAndStake(mainTokenAmount, otherTokenAmount, 0, 0, deadline());
    */
}

async function approveIfNot(token: BaseToken, owner: string, spender: string, amount: BigNumber) {
    const allowance = await token.allowance(owner, spender);
    if (allowance.gte(amount)) {
        return;
    }
    await token.approve(spender, amount);
    console.log(
        `      - Approved ${token.symbol ? await token.symbol() : token.address} for ${getDisplayBalance(
            amount
        )} tokens`
    );
}

/* eslint-disable no-unused-vars */
function deadline() {
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}
/* eslint-disable no-unused-vars */

deployStep.tags = tags;

export default deployStep;