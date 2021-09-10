import {task} from 'hardhat/config';
import {TaskArguments} from 'hardhat/types';

import {Migrations, Migrations__factory} from '../../typechain';

task('deploy:Migrations').setAction(async function (taskArguments: TaskArguments, {ethers}) {
    const migrationsFactory: Migrations__factory = await ethers.getContractFactory('Migrations');
    const migrations: Migrations = <Migrations>await migrationsFactory.deploy();
    await migrations.deployed();
    console.log('Migrations deployed to: ', migrations.address);
});
