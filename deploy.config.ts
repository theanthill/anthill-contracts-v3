// Start dates
export const POOL_START_DATE = 1619777245; // 01/14/2021 @ 4:00am (UTC)
export const ORACLE_START_DATE = 1619777245; // 01/19/2021 @ 4:00am (UTC)
export const TREASURY_START_DATE = 1619777245; // 01/21/2021 @ 4:00am (UTC)

// Epoch periods
export const POOL_PERIOD = 600; // 10 minutes
export const ORACLE_PERIOD = 86400; // 1 Day
export const TREASURY_PERIOD = 600; // 1 Day

// Timelocks
export const TREASURY_TIMELOCK_PERIOD = 2 * 86400; // 2 Days
export const OPERATOR_TIMELOCK_PERIOD = 2 * 86400; // 2 Days

// Liquidity Fee
export const LIQUIDITY_FEE = 3000;

// Real networks with already deployed Swaps and BUSD
export const LOCAL_NETWORKS = ["hardhat", "localhost"];
export const TEST_NETWORKS = ["rinkeby", "arb-rinkeby"];
export const MAIN_NETWORKS = ["mainnet", "arbitrum"];
