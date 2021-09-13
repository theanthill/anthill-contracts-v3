//import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import './tasks/accounts';
import './tasks/clean';

import {resolve} from 'path';

import {config as dotenvConfig} from 'dotenv';
import {HardhatUserConfig} from 'hardhat/config';

import {
    getInfuraChainConfig,
    getAlchemyChainConfig,
    getHardhatChainConfig,
    getLocalhostChainConfig,
} from './hardhat.helpers';

dotenvConfig({path: resolve(__dirname, './.env')});

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    namedAccounts: {
        deployer: 0,
        simpleERC20Beneficiary: 1,
    },
    gasReporter: {
        currency: 'USD',
        enabled: process.env.REPORT_GAS ? true : false,
        excludeContracts: [],
        src: './contracts',
    },
    networks: {
        localhost: getLocalhostChainConfig(),
        hardhat: getHardhatChainConfig(),
        goerli: getInfuraChainConfig('goerli'),
        kovan: getInfuraChainConfig('kovan'),
        rinkeby: getInfuraChainConfig('rinkeby'),
        ropsten: getInfuraChainConfig('ropsten'),
        'arb-rinkeby': getAlchemyChainConfig('arb-rinkeby'),
    },
    paths: {
        artifacts: './artifacts',
        cache: './cache',
        sources: './contracts',
        tests: './test',
    },
    solidity: {
        version: '0.7.6',
        settings: {
            metadata: {
                // Not including the metadata hash
                // https://github.com/paulrberg/solidity-template/issues/31
                bytecodeHash: 'none',
            },
            // Disable the optimizer when debugging
            // https://hardhat.org/hardhat-network/#solidity-optimizer-support
            optimizer: {
                enabled: true,
                runs: 800,
            },
        },
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5',
        externalArtifacts: [
            '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json',
            '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json',
            '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json',
            '@uniswap/v3-staker/artifacts/contracts/interfaces/IUniswapV3Staker.sol/IUniswapV3Staker.json',
            '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json',
            '@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json',
        ],
    },
};

export default config;
