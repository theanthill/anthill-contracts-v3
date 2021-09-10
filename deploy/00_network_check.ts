import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {LOCAL_NETWORKS, TEST_NETWORKS, MAIN_NETWORKS} from '../deploy.config';

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const network = hre.network.name;

    if (!LOCAL_NETWORKS.includes(network) && !TEST_NETWORKS.includes(network) && !MAIN_NETWORKS.includes(network)) {
        throw new Error(`Network:${network} is not a valid network for deployment`);
    }
};

deployStep.tags = [];

export default deployStep;
