/**
 * Export external contracts addresses
 */
const {getSwapFactory, getSwapRouter, getTokenContract, getBUSD, getBNB, getETH} = require('./external-contracts');
const {exportContract, exportToken} = require('./export-contracts');

const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS, LIQUIDITY_FEE} = require('../deploy.config');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const BUSD = await getBUSD(network);
    const BNB = await getBNB(network);
    const ETH = await getETH(network);
    const swapRouter = await getSwapRouter(network);
    const swapFactory = await getSwapFactory(network);

    exportToken('BUSD', BUSD.address, 18);
    exportToken('BNB', BNB.address, 18);
    exportToken('ETH', ETH.address, 18);
    exportContract('PancakeRouter', swapRouter.address);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const mainToken = await getTokenContract(pool.mainToken, network);
        const otherToken = await getTokenContract(pool.otherToken, network);

        const poolAddress = await swapFactory.getPool(mainToken.address, otherToken.address, LIQUIDITY_FEE);
        console.log(`${pool.mainToken}-${pool.otherToken} at ${poolAddress}`);
        exportToken(pool.mainToken + '-' + pool.otherToken, poolAddress, 18);
    }
};
