/**
 * Allocation of Ant Tokens for Rewards Distributor and initial distribution, only for Testnet.
 * On the Mainnet the allocation will be done by the Treasury account
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

import { TEST_REWARD_PER_STAKING_POOL, INITIAL_ETH_DEPLOYMENT_POOLS } from "../config";
import { MAIN_NETWORKS } from "../deploy.config";

import { AntToken, IPoolStakerV3WithRewards } from "../typechain";
import { getDisplayBalance } from "../utils/helperFunctions";

const tags: string[] = [];

const deployStep: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const ethers = hre.ethers;
    const network = hre.network.name;

    // Test only
    if (MAIN_NETWORKS.includes(network)) {
        return;
    }

    console.log("[TEST: Providing initial staking incentives]");

    const antToken = (await ethers.getContract("AntToken")) as AntToken;

    const initialDeploymentPools = INITIAL_ETH_DEPLOYMENT_POOLS;

    const unit = BigNumber.from(10).pow(18);
    const rewardPerPool = unit.mul(TEST_REWARD_PER_STAKING_POOL);

    for (const poolConfig of initialDeploymentPools) {
        const pool = (await ethers.getContract(poolConfig.contractName)) as IPoolStakerV3WithRewards;

        console.log(`  - Minting ${getDisplayBalance(rewardPerPool)} ANT Tokens for rewards`);
        await antToken.mint(pool.address, rewardPerPool).then(tx => tx.wait());

        const YEAR = 365 * 86400;
        const Now = Math.round(Date.now() / 1000) + 60;
        const YearFromNow = Now + YEAR;

        console.log(
            `  - Creating incentive of ${getDisplayBalance(rewardPerPool)} ANT tokens for ${
                poolConfig.contractName
            } pool`,
        );
        await pool.createIncentive(rewardPerPool, Now, YearFromNow).then(tx => tx.wait());
    }
};

deployStep.tags = tags;

export default deployStep;
