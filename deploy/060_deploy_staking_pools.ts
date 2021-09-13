/**
 * Creation of the LP Token Staking pools for the supported pairs
 */
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {TEST_TREASURY_ACCOUNT, INITIAL_ETH_DEPLOYMENT_POOLS} from '../config';
import {LIQUIDITY_FEE} from '../deploy.config';

import {AntToken, IUniswapV3Factory, IUniswapV3Staker} from '../typechain';

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployer} = await hre.getNamedAccounts();
    const ethers = hre.ethers;
    const {deploy} = hre.deployments;

    console.log('[Deploy Staking contracts]');

    const antToken = (await ethers.getContract('AntToken')) as AntToken;
    const swapFactory = (await ethers.getContract('IUniswapV3Factory')) as IUniswapV3Factory;
    const poolStaker = (await ethers.getContract('IUniswapV3Staker')) as IUniswapV3Staker;

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;

    for (const poolConfig of initialDeploymentPools) {
        const otherToken = await ethers.getContract(poolConfig.otherToken);

        console.log(`  - Deploying staking pool for the ANT/${poolConfig.otherToken} pair`);
        const poolAddress = await swapFactory.getPool(antToken.address, otherToken.address, LIQUIDITY_FEE);

        await deploy(poolConfig.contractName, {
            from: deployer,
            log: true,
            args: [poolStaker.address, poolAddress, antToken.address, TEST_TREASURY_ACCOUNT],
        });

        tags.push(poolConfig.contractName);
    }
};

deployStep.tags = tags;

export default deployStep;
