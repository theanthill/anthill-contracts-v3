/**
 * Transfer operator and ownership of the deployed contracts
 */

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {ADMIN_ACCOUNT, TEST_ADMIN_ACCOUNT, INITIAL_ETH_DEPLOYMENT_POOLS} from '../config';
import {MAIN_NETWORKS} from '../deploy.config';

import {HardhatEthersHelpers} from 'hardhat-deploy-ethers/dist/src/types';

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const network = hre.network.name;

    console.log('[Assigning contracts Admin and Operator roles]');

    const treasury = await ethers.getContract('Treasury');
    const treasuryTimelock = await ethers.getContract('TreasuryTimelock');
    const operatorTimelock = await ethers.getContract('OperatorTimelock');

    // Operator
    console.log(`  - Assigning Treasury contract governance roles`);
    await assignOperator(ethers, 'Treasury', treasury.address, ['AntToken', 'AntShare', 'AntBond', 'Boardroom']);

    console.log(`Assigning Treasury Timelock contract governance roles`);
    await assignOperator(ethers, 'TreasuryTimelock', treasuryTimelock.address, ['ContributionPool']);

    console.log(`Assigning Operator Timelock contract governance roles`);
    await assignOperator(ethers, 'OperatorTimelock', operatorTimelock.address, ['Treasury']);

    // Admin
    console.log(`  - Assigning Admin role`);
    const adminAccount = MAIN_NETWORKS.includes(network) ? ADMIN_ACCOUNT : TEST_ADMIN_ACCOUNT;
    const adminContracts = [
        'AntToken',
        'AntShare',
        'AntBond',
        'Treasury',
        'Boardroom',
        'TreasuryTimelock',
        'ContributionPool',
        ...INITIAL_ETH_DEPLOYMENT_POOLS.map((config) => config.contractName),
    ];

    await assignAdmin(ethers, 'Admin Account', adminAccount, adminContracts);
};

// ============ Helper Functions ============
async function assignOperator(
    ethers: HardhatEthersHelpers,
    operatorName: string,
    operatorAddress: string,
    contracts: string[]
) {
    for await (const contractName of contracts) {
        const contract = await ethers.getContract(contractName);

        console.log(
            `  - Assign ${operatorName} (${operatorAddress}) as ${contractName} (${contract.address}) Operator`
        );
        await contract.transferOperator(operatorAddress);
    }
}

async function assignAdmin(
    ethers: HardhatEthersHelpers,
    accountName: string,
    accountAddress: string,
    contracts: string[]
) {
    for await (const contractName of contracts) {
        const contract = await ethers.getContract(contractName);

        console.log(`  - Assign ${accountName} (${accountAddress}) as ${contractName} (${contract.address}) Admin`);
        await contract.transferAdmin(accountAddress);
    }
}

deployStep.tags = tags;

export default deployStep;
