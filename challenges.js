
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
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-1-10K',
            label: 'Provide liquidity on WETH-WGLQ Pool 1-10K',
            reward: 1,
            progression: (account) => {
                return 0;
            },
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-10K-50K',
            label: 'Provide liquidity on WETH-WGLQ Pool 10K-50K',
            reward: 5,
            progression: (account) => {
                return 0;
            },
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-50K-100K',
            label: 'Provide liquidity on WETH-WGLQ Pool 50K-100K',
            reward: 10,
            progression: (account) => {
                return 0;
            },
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP-100K+',
            label: 'Provide liquidity on WETH-WGLQ Pool 100K+',
            reward: 15,
            progression: (account) => {
                return 0;
            },
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-1-10K',
            label: 'Bridge ETH on the GLQ Chain 1-10K',
            reward: 1,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 1) {
                    return 100;
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
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-10-50K',
            label: 'Bridge ETH on the GLQ Chain 10-50K',
            reward: 5,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 1) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 10000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 10000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-50-100K',
            label: 'Bridge ETH on the GLQ Chain 50-100K',
            reward: 10,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 1) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 50000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 50000) {
                    return 'COMPLETED';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN-100K+',
            label: 'Bridge ETH on the GLQ Chain 100K+',
            reward: 15,
            progression: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 1) {
                    return Math.min(account?.bridges['WETH_GLQCHAIN'] * 100 / 100000, 100);
                }
                return 0;
            },
            status: (account) => {
                if (account?.bridges !== undefined && account?.bridges['WETH_GLQCHAIN'] >= 100000) {
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