// import { useWalletClient } from 'wagmi';
// import { BrowserProvider, JsonRpcSigner } from 'ethers';
// import { useEffect, useState } from 'react';
// import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';

// export function use0gBroker() {
//     const { data: walletClient } = useWalletClient();
//     const [broker, setBroker] = useState<any>(null);

//     useEffect(() => {
//         async function initBroker() {
//             if (!walletClient) {
//                 setBroker(null);
//                 return;
//             }

//             try {
//                 const network = {
//                     chainId: walletClient.chain.id,
//                     name: walletClient.chain.name,
//                     ensAddress: undefined,
//                 };

//                 const provider = new BrowserProvider(walletClient.transport, network);
//                 const signer = new JsonRpcSigner(provider, walletClient.account.address);

//                 const newBroker = await createZGComputeNetworkBroker(signer);
//                 setBroker(newBroker);
//             } catch (err) {
//                 console.error("Failed to initialize 0g broker", err);
//             }
//         }

//         initBroker();
//     }, [walletClient]);

//     return broker;
// }
