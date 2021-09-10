import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction, DeploymentSubmission} from 'hardhat-deploy/types';
import {getDeploymentSubmission, ExternalArtifacts} from '../config/external-artifacts';

let tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {save} = hre.deployments;
    const network = hre.network.name;

    Object.keys(ExternalArtifacts).forEach(async (contractName) => {
        const deploymentSubmission: DeploymentSubmission = getDeploymentSubmission(contractName, network);
        await save(contractName, deploymentSubmission);
        tags.push(contractName);
    });
};

deployStep.tags = tags;

export default deployStep;
