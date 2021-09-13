/**
 * External artifacts already deployed in diferent networks
 */
import {DeploymentSubmission} from 'hardhat-deploy/types';
import {KnownContracts} from './known-contracts';

export interface ExternalArtifacts {
    [name: string]: DeploymentSubmission;
}

export const ExternalArtifacts: ExternalArtifacts = {
    INonfungiblePositionManager: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json'),
    IUniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'),
    ISwapRouter: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'),
    IUniswapV3Staker: require('@uniswap/v3-staker/artifacts/contracts/interfaces/IUniswapV3Staker.sol/IUniswapV3Staker.json'),
    IUniswapV3Pool: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'),
    IQuoter: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json'),
};

export function getDeploymentSubmission(contractName: string, network: string): DeploymentSubmission {
    const deploymentSubmission: DeploymentSubmission = ExternalArtifacts[contractName];

    if (contractName in KnownContracts) {
        const address: string = KnownContracts[contractName][network];
        deploymentSubmission.address = address;
    }

    return deploymentSubmission;
}
