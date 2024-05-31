
const getAllChallenges = () => {
    return [
        {
            id: 'SWAP-GLQ-FOR-ANOTHER-TOKEN-1-10K',
            label: 'Swap GLQ for another token 1-10K Volume',
            reward: 1,
            progression: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 1) {
                    return 100;
                }
                return 0;
            },
            status: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 1) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'SWAP-GLQ-FOR-ANOTHER-TOKEN-10K-50K',
            label: 'Swap GLQ for another token 10-50K Volume',
            reward: 5,
            progression: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 1) {
                    return Math.min(account?.swaps['WETH/WGLQ'] * 100 / 10000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 10000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            },
            available: true
        },
        {
            id: 'SWAP-GLQ-FOR-ANOTHER-TOKEN-50K-100K',
            label: 'Swap GLQ for another token 50-100K Volume',
            reward: 10,
            progression: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 1) {
                    return Math.min(account?.swaps['WETH/WGLQ'] * 100 / 50000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 50000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            },
            available: true
        },
        {
            id: 'SWAP-GLQ-FOR-ANOTHER-TOKEN-100K+',
            label: 'Swap GLQ for another token 100K+ Volume',
            reward: 15,
            progression: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 1) {
                    return Math.min(account?.swaps['WETH/WGLQ'] * 100 / 100000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.swaps !== undefined && account?.swaps['WETH/WGLQ'] >= 100000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            },
            available: true
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-1',
            label: 'Add 1 WGLQ of liquidity on WETH-WGLQ Pool',
            reward: 1,
            progression: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] > 0) {
                    return Math.min(account.liquidityPools['WETH/WGLQ']['WGLQ'] * 100 / 1, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] >= 1) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-1K',
            label: 'Add 1,000 WGLQ of liquidity on WETH-WGLQ Pool',
            reward: 5,
            progression: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] > 0) {
                    return Math.min(account.liquidityPools['WETH/WGLQ']['WGLQ'] * 100 / 1000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] >= 1000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-10K',
            label: 'Add 10,000 WGLQ of liquidity on WETH-WGLQ Pool',
            reward: 10,
            progression: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] > 0) {
                    return Math.min(account.liquidityPools['WETH/WGLQ']['WGLQ'] * 100 / 10000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] >= 10000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-100K+',
            label: 'Add 100,000 WGLQ of liquidity on WETH-WGLQ Pool',
            reward: 15,
            progression: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] > 0) {
                    return Math.min(account.liquidityPools['WETH/WGLQ']['WGLQ'] * 100 / 100000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.liquidityPools !== undefined && account.liquidityPools['WETH/WGLQ'] !== undefined && account.liquidityPools['WETH/WGLQ']['WGLQ'] >= 100000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-0.01-1',
            label: 'Bridge 0.01 ETH on the GLQ Chain',
            reward: 1,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 0) {
                    return 100;
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 0.01) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-1',
            label: 'Bridge 1 ETH on the GLQ Chain',
            reward: 5,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 0) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 1, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 1) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-5',
            label: 'Bridge 5 ETH on the GLQ Chain',
            reward: 10,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 0) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 5, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 5) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-10',
            label: 'Bridge 10 ETH on the GLQ Chain',
            reward: 15,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 0) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 10, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 10) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        }
    ];
};

module.exports = {
    getAllChallenges
};