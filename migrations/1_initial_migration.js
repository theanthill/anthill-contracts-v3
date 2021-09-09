const Artifactor = require('@truffle/artifactor');

const {LOCAL_NETWORKS, TEST_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.js');

const artifactor = new Artifactor(`${__dirname}/../build/contracts`);

const ExternalArtifacts = {
    INonfungiblePositionManager: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json'),
    IUniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'),
    ISwapRouter: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'),
    IUniswapV3Staker: require('@uniswap/v3-staker/artifacts/contracts/interfaces/IUniswapV3Staker.sol/IUniswapV3Staker.json'),
    IUniswapV3Pool: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'),
    IQuoter: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json'),
};

const Migrations = artifacts.require('Migrations');

module.exports = async function (deployer, network) {
    if (!LOCAL_NETWORKS.includes(network) && !TEST_NETWORKS.includes(network) && !MAIN_NETWORKS.includes(network)) {
        throw new Error(`Network:${network} is not a valid network for deployment`);
    }

    for await ([contractName, contractArtifact] of Object.entries(ExternalArtifacts)) {
        await artifactor.save({
            contractName,
            ...contractArtifact,
        });
    }

    await deployer.deploy(Migrations);
};
