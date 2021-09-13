import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

/**
 * Deploys ANT, ANTS and ANTB tokens
 */

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployer} = await hre.getNamedAccounts();
    const {deploy} = hre.deployments;

    console.log('[Deploy system tokens]');
    await deploy('AntToken', {
        from: deployer,
        log: true,
    });
    await deploy('AntBond', {
        from: deployer,
        log: true,
    });
    await deploy('AntShare', {
        from: deployer,
        log: true,
    });
};

deployStep.tags = ['AntToken', 'AntBond', 'AntShare'];

export default deployStep;
