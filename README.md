# Council_XL
Ai council templating engine

A Python web API that routes an idea through a council of specialized AI agents, each powered by 0G Private Computer's OpenAI-compatible inference API (models like DeepSeek, Qwen, GLM). The council brutally stress-tests the idea, then synthesizes a structured implementation plan.



```
Council_XL
├── Frontend (Vite + React)
│   ├── vite.config.ts          ← node polyfills required
│   │   └── vite-plugin-node-polyfills
│   │       (crypto, stream, util, buffer, process)
│   └── WalletConnect integration
│       └── @walletconnect/modal or wagmi
│
└── Inference Layer
    ├── @0glabs/0g-serving-broker
    ├── ethers
    └── openai (optional, for OpenAI-compatible client)
```
