import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

/**
 * Migration contract
 */

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployer} = await hre.getNamedAccounts();
    const {deploy} = hre.deployments;

    await deploy('Migrations', {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

deploy.tags = ['Migrations'];

export default deploy;
