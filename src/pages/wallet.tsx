'use client'

import { useAppContext } from '@/contexts/app-provider';
import WalletConnectView from '@/views/wallet-connect.view';
import { getDefaultConfig, OPConnectProvider } from '@otherpage/connect';
import { mainnet, sepolia } from 'viem/chains';
import { createConfig, WagmiProvider } from 'wagmi';

import { defineChain } from 'viem';

const local = /*#__PURE__*/ defineChain({
  id: 31_337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})

const apeChain = defineChain({
  id: 33111,
  name: 'Curtis',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://curtis.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://curtis.explorer.caldera.xyz/',
      apiUrl: 'https://curtis.blockscout.com/api',
    },
  },
  // contracts: {
  //   multicall3: {
  //     address: '0xca11bde05977b3631167028862be2a173976ca11',
  //     blockCreated: 751532,
  //   },
  //   ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
  //   ensUniversalResolver: {
  //     address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
  //     blockCreated: 5_317_080,
  //   },
  // },
  testnet: true,
})

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia, apeChain, local],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: 'My OP Connect App',
    ssr: true,
  })
);
export default function Wallet() {
  const { mode, primaryColor } = useAppContext();

  return (
    <WagmiProvider config={config}>
      <OPConnectProvider mode={mode} primaryColor={primaryColor}>
        <WalletConnectView />
      </OPConnectProvider>
    </WagmiProvider>
  );
}
