
const getAllChallenges = () => {
    return [
        {
            id: 'SWAP-GLQ-FOR-ANOTHER-TOKEN',
            label: 'Swap GLQ for another token',
            reward: 1,
            progression: 0,
            status: (account) => {
                if (account?.swaps !== undefined) {
                    if (account?.claims['SWAP-GLQ-FOR-ANOTHER-TOKEN']) {
                        return 'COMPLETED';
                    }
                    return 'CLAIMABLE';
                }
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: true
        },
        {
            id: 'PROVIDE-LIQUIDITY-ON-UNISWAP',
            label: 'Provide liquidity on Uniswap',
            reward: 1,
            progression: 0,
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'BRIDGE-ETH-ON-THE-GLQ-CHAIN',
            label: 'Bridge ETH on the GLQ Chain',
            reward: 1,
            progression: 0,
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'COMPLETE-A-TRANSACTION-WITH-GLQ',
            label: 'Complete a transaction with GLQ',
            reward: 1,
            progression: 0,
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'UNWRAP-WGLQ',
            label: 'Unwrap one WGLQ to GLQ',
            reward: 1,
            progression: 0,
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        },
        {
            id: 'WRAP-GLQ',
            label: 'Wrap one GLQ to WGLQ',
            reward: 1,
            progression: 0,
            status: (account) => {
                return 'IN_PROGRESS';
            }, // IN_PROGRESS, CLAIMABLE, COMPLETED
            available: false
        }
    ];
};

module.exports = {
    getAllChallenges
};