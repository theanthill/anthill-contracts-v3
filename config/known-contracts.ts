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
        rinkeby: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        "arb-rinkeby": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        hardhat: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        localhost: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    },

    ISwapRouter: {
        rinkeby: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        "arb-rinkeby": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        hardhat: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        localhost: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    },

    INonfungiblePositionManager: {
        rinkeby: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        "arb-rinkeby": "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        hardhat: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        localhost: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    },

    IUniswapV3Staker: {
        rinkeby: "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d",
        "arb-rinkeby": "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d",
        hardhat: "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d",
        localhost: "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d",
    },
    IQuoter: {
        rinkeby: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        "arb-rinkeby": "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        hardhat: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        localhost: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
};
