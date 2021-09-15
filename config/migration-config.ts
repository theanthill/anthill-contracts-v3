/**
 * Configuration for the ANT token migration
 */

// Amount of Ant Shares allocated for Treasury at deploy
export const TREASURY_ANT_ALLOCATION = 5000000;

// Maximum total amount of Ant Shares to be pre-minted
export const MAX_ANTS_SUPPLY = 21000000;

export interface StakingPoolConfig {
    contractName: string;
    helperContract: string;
    mainToken: string;
    otherToken: string;
}

// ANT-USDC LP Tokens pool that generate ANT Token rewards
export const ANTUSDCLPTokenPool: StakingPoolConfig = {
    contractName: "USDCANTPoolStakerANT",
    helperContract: "USDCANTPoolHelper",
    mainToken: "AntToken",
    otherToken: "MockUSDC",
};

// ANT-ETH LP Tokens pool that generate ANT Token rewards
export const ANTETHLPTokenPool: StakingPoolConfig = {
    contractName: "ETHANTPoolStakerANT",
    helperContract: "ETHANTPoolHelper",
    mainToken: "AntToken",
    otherToken: "MockETH",
};

export const INITIAL_ETH_DEPLOYMENT_POOLS: StakingPoolConfig[] = [ANTUSDCLPTokenPool, ANTETHLPTokenPool];

// Price range for the liquidity pools
export const PRICE_LOWER = 0.9;
export const PRICE_UPPER = 1.1;

// System accounts
//
// [workerant] Set the final values before mainnet deployment
export const TREASURY_ACCOUNT = "";
export const OPERATOR_ACCOUNT = "";
export const ADMIN_ACCOUNT = "";

/**
 * Test configuration
 */
// HQ Account used for testing
export const TEST_TREASURY_ACCOUNT = "0xF9D5169aA864C1Ddda2Aba931Edf722f98B2D159";
export const TEST_OPERATOR_ACCOUNT = "0x8a612956aBAF09C37e4372d7890835294080eb30";
export const TEST_ADMIN_ACCOUNT = "0xF9D5169aA864C1Ddda2Aba931Edf722f98B2D159";
export const TEST_HQ_ACCOUNT = "0x47Ce08590BdB1162EaDE736EfaAbf2aa2d5C8C92";

// Amount of Ant Shares allocated for HQ at deploy
export const TEST_HQ_ANTS_ALLOCATION = 2100000;

// Amount of Ant Tokens allocated for HQ at deploy
export const TEST_HQ_ANT_ALLOCATION = 100000;

// Amount of fake BNB tokens to be minted at deploy
export const TEST_INITIAL_BNB_SUPPLY = 1000;

// Amount of fake ETH tokens to be minted at deploy
export const TEST_INITIAL_ETH_SUPPLY = 1000;

// Amount of fake USDC tokens to be minted at deploy
export const TEST_INITIAL_USDC_SUPPLY = 300000;

// Amount of Ant Tokens allocated for the ANTUSDC liquidity pool
export const TEST_ANT_LIQUIDITY_PER_POOL = 50000;

// Maximum amount of tokens to refill from faucet
export const TEST_FAUCET_MAX_REFILL = 100;

// Maximum amount of tokens to refill from faucet
export const TEST_FAUCET_INITIAL_ALLOCATION = 500000;

// Initial Ant Token rewards allocation
export const TEST_REWARD_PER_STAKING_POOL = 50000;
