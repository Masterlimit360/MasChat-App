# Blockchain Setup Guide

## Current Status

The MasChat app is currently configured to work **without blockchain functionality** since the MassCoin token has not been deployed yet. This allows you to develop and test the app using mock data.

## What's Disabled

- Real blockchain transactions
- Smart contract interactions
- Wallet connections to actual networks
- Real-time balance updates

## What's Working

- Mock MassCoin balance (1000 MASS)
- Mock transactions and transfer requests
- Mock staking functionality
- All UI components and screens
- Backend API integration (when available)

## How to Enable Blockchain

### 1. Deploy the MassCoin Token

First, deploy your smart contracts to Polygon Amoy testnet:

```bash
# Compile contracts
npm run compile

# Deploy to Amoy testnet
npm run deploy:amoy

# Or deploy to Polygon mainnet
npm run deploy:polygon
```

### 2. Update Contract Addresses

After deployment, update the contract addresses in:
- `app/lib/services/web3Service.ts` - Update `CONTRACT_ADDRESSES`
- `app/lib/services/massCoinService.ts` - Update any hardcoded addresses

### 3. Enable Blockchain in the App

Once contracts are deployed, you can enable blockchain functionality:

1. **Programmatically**: Call `massCoinService.enableBlockchain()` and `web3Service.enableBlockchain()`
2. **Via UI**: Use the `BlockchainStatus` component which provides a button to enable blockchain
3. **In Web3Context**: The context will automatically detect when blockchain is enabled

## Network Configuration

### Polygon Amoy (Testnet)
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Block Explorer**: https://amoy.polygonscan.com

### Polygon Mainnet
- **Chain ID**: 137
- **RPC URL**: https://polygon-rpc.com
- **Block Explorer**: https://polygonscan.com

## Environment Variables

Create a `.env` file with:

```env
# For Amoy testnet
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_private_key_here

# For Polygon mainnet
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Gas reporting
REPORT_GAS=true
```

## Testing Without Blockchain

The app currently provides mock data:

- **Mock Wallet**: 1000 MASS tokens
- **Mock Transactions**: Sample send/receive transactions
- **Mock Staking**: Sample staking positions
- **Mock Transfer Requests**: Sample pending transfers

## Troubleshooting

### Metro Bundler Issues

If you encounter Metro bundler errors:

1. Run the fix script: `fix-metro.bat`
2. Clear Metro cache: `npx expo start --clear`
3. Reinstall dependencies: `npm install`

### Blockchain Connection Issues

- Ensure you have the correct RPC URLs
- Check that your private key has sufficient funds for gas
- Verify the network chain ID matches your configuration

## Next Steps

1. **Deploy contracts** to Amoy testnet
2. **Test functionality** with real blockchain
3. **Update addresses** in the app
4. **Enable blockchain** functionality
5. **Deploy to mainnet** when ready

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your network configuration
3. Ensure contracts are properly deployed
4. Check that your wallet has sufficient funds
