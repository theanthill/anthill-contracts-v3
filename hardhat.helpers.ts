import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatNetworkUserConfig, NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

type AutoOptions = {
    goerli: "auto" | number;
    hardhat: "auto" | number;
    kovan: "auto" | number;
    mainnet: "auto" | number;
    rinkeby: "auto" | number;
    ropsten: "auto" | number;
    "arb-rinkeby": "auto" | number;
};

export const ChainIds = {
    goerli: 5,
    hardhat: 31337,
    kovan: 42,
    mainnet: 1,
    rinkeby: 4,
    ropsten: 3,
    "arb-rinkeby": 421611,
};

export const GasPrice: AutoOptions = {
    goerli: "auto",
    hardhat: "auto",
    kovan: "auto",
    mainnet: "auto",
    rinkeby: 15000000000,
    ropsten: "auto",
    "arb-rinkeby": "auto",
};

export const Gas: AutoOptions = {
    goerli: "auto",
    hardhat: "auto",
    kovan: "auto",
    mainnet: "auto",
    rinkeby: 20000000,
    ropsten: "auto",
    "arb-rinkeby": 1287983320,
};

export const Networks = Object.keys(ChainIds);
export type NetworksType = keyof typeof ChainIds;

// Ensure that we have all the environment variables we need.
export const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
    throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
    throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
    throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
}

export function getHardhatChainConfig(): HardhatNetworkUserConfig {
    return {
        accounts: {
            mnemonic,
        },
        chainId: ChainIds.hardhat,
    };
}

export function getLocalhostChainConfig(): NetworkUserConfig {
    return {
        url: "http://127.0.0.1:8545",
        accounts: {
            mnemonic,
        },
    };
}

export function getChainConfig(network: NetworksType): NetworkUserConfig {
    if (network === "arb-rinkeby") {
        const url: string = "https://" + network + ".g.alchemy.com/v2/" + alchemyApiKey;
        return {
            accounts: {
                count: 10,
                mnemonic,
                path: "m/44'/60'/0'/0",
            },
            chainId: ChainIds[network],
            gas: Gas[network] || "auto",
            gasPrice: GasPrice[network] || "auto",
            url,
        };
    } else {
        const url: string = "https://" + network + ".infura.io/v3/" + infuraApiKey;
        return {
            accounts: {
                count: 10,
                mnemonic,
                path: "m/44'/60'/0'/0",
            },
            chainId: ChainIds[network],
            gas: Gas[network],
            gasPrice: GasPrice[network],
            url,
        };
    }
}
