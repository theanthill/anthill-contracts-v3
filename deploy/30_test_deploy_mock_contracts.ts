/**
 * Deploy Mock contract for testing
 */

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {MAIN_NETWORKS} from '../deploy.config';
import {
    TEST_INITIAL_BUSD_SUPPLY,
    TEST_INITIAL_BNB_SUPPLY,
    TEST_INITIAL_ETH_SUPPLY,
    TEST_FAUCET_MAX_REFILL,
    TEST_FAUCET_INITIAL_ALLOCATION,
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    TEST_HQ_ACCOUNT,
} from '../config/migration-config';

import {BigNumber} from '@ethersproject/bignumber';

import {MockETH, MockBUSD} from '../typechain';

let tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployer} = await hre.getNamedAccounts();
    const {deploy, execute} = hre.deployments;
    const deployments = await hre.deployments.all();
    const network = hre.network.name;
    const ethers = hre.ethers;

    // BUSD
    if (!MAIN_NETWORKS.includes(network)) {
        await deploy('MockBUSD', {
            from: deployer,
            log: true,
        });
        await deploy('MockETH', {
            from: deployer,
            log: true,
        });

        const unit = BigNumber.from(10).pow(18);
        const busdInitialAllocation = unit.mul(TEST_INITIAL_BUSD_SUPPLY);
        const ethInitialAllocation = unit.mul(TEST_INITIAL_ETH_SUPPLY);

        const mockBUSD = (await ethers.getContract('MockBUSD')) as MockBUSD;
        const mockETH = (await ethers.getContract('MockBUSD')) as MockETH;

        mockBUSD.mint(deployer, busdInitialAllocation, {from: deployer});
        mockETH.mint(deployer, ethInitialAllocation, {from: deployer});

        tags.push('MockBUSD');
        tags.push('MockETH');
    }

    // Faucet
    if (!MAIN_NETWORKS.includes(network)) {
        const faucetMaxRefill = BigNumber.from(10).pow(18).mul(TEST_FAUCET_MAX_REFILL);
        const faucetInitialAllocation = BigNumber.from(10).pow(18).mul(TEST_FAUCET_INITIAL_ALLOCATION);

        const antToken = deployments['AntToken'];
        const mockBUSD = deployments['MockBUSD'];
        const mockETH = deployments['MockETH'];

        const tokenFaucet = await deploy('TokenFaucet', {
            from: deployer,
            log: true,
            args: [
                antToken.address,
                mockBUSD.address,
                mockETH.address,
                faucetMaxRefill,
                [TEST_TREASURY_ACCOUNT, TEST_OPERATOR_ACCOUNT, TEST_ADMIN_ACCOUNT, TEST_HQ_ACCOUNT],
            ],
        });

        await execute('AntToken', {from: deployer, log: true}, 'mint', tokenFaucet.address, faucetInitialAllocation);
        await execute('MockBUSD', {from: deployer, log: true}, 'mint', tokenFaucet.address, faucetInitialAllocation);
        await execute('MockETH', {from: deployer, log: true}, 'mint', tokenFaucet.address, faucetInitialAllocation);

        tags.push('TokenFaucet');
    }
};

deployStep.tags = tags;

export default deployStep;
