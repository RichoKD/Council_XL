import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import './index.css'
import App from './App.tsx'

const zgMainnet = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc.0g.ai'] } },
}
const zgTestnet = {
  id: 16602,
  name: '0G Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } },
}

const queryClient = new QueryClient()
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

const metadata = {
  name: 'Council_XL',
  description: 'AI Council Templating UI',
  url: 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// @ts-expect-error custom network types
const networks = [zgMainnet, zgTestnet, mainnet]

const wagmiAdapter = new WagmiAdapter({
  // @ts-expect-error custom network types
  networks,
  projectId,
  ssr: false
})

createAppKit({
  adapters: [wagmiAdapter],
  // @ts-expect-error custom network types
  networks,
  projectId,
  metadata,
  features: {
    analytics: false // Disabled to avoid some 403/blocked errors with public project IDs
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
