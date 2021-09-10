/**
 * List of known addresses for the different networks
 */
export interface ExternalContract {
    [key: string]: string;
}
export interface ExternalContractMap {
    [key: string]: ExternalContract;
}

export const KnownContracts: ExternalContractMap = {
    IUniswapV3Factory: {
        // Ethereum
        'eth-local-ropsten': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'eth-ropsten': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'eth-local-rinkeby': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'eth-rinkeby': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'eth-local-mainnet': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'eth-mainnet': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'arbitrum-testnet': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        hardhat: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    },

    ISwapRouter: {
        // Ethereum
        'eth-local-ropsten': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'eth-ropsten': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'eth-local-rinkeby': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'eth-rinkeby': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'eth-local-mainnet': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'eth-mainnet': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        'arbitrum-testnet': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        hardhat: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },

    INonfungiblePositionManager: {
        // Ethereum
        'eth-local-ropsten': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'eth-ropsten': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'eth-local-rinkeby': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'eth-rinkeby': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'eth-local-mainnet': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'eth-mainnet': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        'arbitrum-testnet': '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        hardhat: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    },

    IUniswapV3Staker: {
        // Ethereum
        'eth-local-ropsten': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'eth-ropsten': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'eth-local-rinkeby': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'eth-rinkeby': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'eth-local-mainnet': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'eth-mainnet': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        'arbitrum-testnet': '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
        hardhat: '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d',
    },
    IQuoter: {
        // Ethereum
        'eth-local-ropsten': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'eth-ropsten': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'eth-local-rinkeby': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'eth-rinkeby': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'eth-local-mainnet': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'eth-mainnet': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        'arbitrum-testnet': '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        hardhat: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    },
};
