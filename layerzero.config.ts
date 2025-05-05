import {ExecutorOptionType} from '@layerzerolabs/lz-v2-utilities';
import {OAppEnforcedOption, OmniPointHardhat} from '@layerzerolabs/toolbox-hardhat';
import {EndpointId} from '@layerzerolabs/lz-definitions';
import {generateConnectionsConfig} from '@layerzerolabs/metadata-tools';

export const sepoliaContract: OmniPointHardhat = {
  eid: EndpointId.SEPOLIA_V2_TESTNET,
  contractName: 'MyOFT',
};

export const solanaContract: OmniPointHardhat = {
  eid: EndpointId.SOLANA_V2_TESTNET,
  address: '5dGf4fDoUoVV151HPqoWeeCY1m6hfShnW4WjNQ2ageC1', // your OFT Store address
};

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 80000,
    value: 0,
  },
  {
    msgType: 2,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 80000,
    value: 0,
  },
  {
    msgType: 2,
    optionType: ExecutorOptionType.COMPOSE,
    index: 0,
    gas: 80000,
    value: 0,
  },
];

const SOLANA_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
  {
    msgType: 1,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000,
    value: 2500000,
  },
  {
    msgType: 2,
    optionType: ExecutorOptionType.LZ_RECEIVE,
    gas: 200000,
    value: 2500000,
  },
  {
    // Solana options use (gas == compute units, value == lamports)
    msgType: 2,
    optionType: ExecutorOptionType.COMPOSE,
    index: 0,
    gas: 0,
    value: 0,
  },
];

export default async function () {
  // note: pathways declared here are automatically bidirectional
  // if you declare A,B there's no need to declare B,A
  const connections = await generateConnectionsConfig([
    [
      sepoliaContract, // Chain A contract
      solanaContract, // Chain B contract
      [['LayerZero Labs'], []], // [ requiredDVN[], [ optionalDVN[], threshold ] ]
      [1, 1], // [A to B confirmations, B to A confirmations]
      [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS], // Chain B enforcedOptions, Chain A enforcedOptions
    ],
  ]);

  return {
    contracts: [{contract: sepoliaContract}, {contract: solanaContract}],
    connections,
  };
}

// import { EndpointId } from "@layerzerolabs/lz-definitions";
// import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
// import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools";
// import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";
// import { ethers } from "hardhat";
//
// import { getOftStoreAddress } from "./tasks/solana";
//
// // Note:  Do not use address for EVM OmniPointHardhat contracts.  Contracts are loaded using hardhat-deploy.
// // If you do use an address, ensure artifacts exists.
// const sepoliaContract: OmniPointHardhat = {
//   eid: EndpointId.SEPOLIA_V2_TESTNET,
//   // contractName: 'MyOFT',
//   address: ethers.utils.hexZeroPad("0xfcdcd0124eec9134eb0a5050608e6bbd34dfdab3", 32)
// };
//
// const solanaContract: OmniPointHardhat = {
//   eid: EndpointId.SOLANA_V2_TESTNET,
//   address: getOftStoreAddress(EndpointId.SOLANA_V2_TESTNET)
// };
//
// const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
//   {
//     msgType: 1,
//     optionType: ExecutorOptionType.LZ_RECEIVE,
//     gas: 80000,
//     value: 0
//   }
// ];
//
// const SOLANA_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
//   {
//     msgType: 1,
//     optionType: ExecutorOptionType.LZ_RECEIVE,
//     gas: 200000,
//     value: 2500000
//   }
// ];
//
// // Learn about Message Execution Options: https://docs.layerzero.network/v2/developers/solana/oft/account#message-execution-options
// // Learn more about the Simple Config Generator - https://docs.layerzero.network/v2/developers/evm/technical-reference/simple-config
// export default async function() {
//   // note: pathways declared here are automatically bidirectional
//   // if you declare A,B there's no need to declare B,A
//   console.log("solanaContract", solanaContract);
//   console.log("sepoliaContract", sepoliaContract);
//   const connections = await generateConnectionsConfig([
//     [
//
//       sepoliaContract, // Chain A contract
//       solanaContract, // Chain B contract
//       [["LayerZero Labs"], []], // [ requiredDVN[], [ optionalDVN[], threshold ] ]
//       [15, 32], // [A to B confirmations, B to A confirmations]
//       [SOLANA_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS] // Chain B enforcedOptions, Chain A enforcedOptions
//     ]
//   ]);
//   const singleConnectionArray = [connections[0]];
//
//   console.log("connections", connections);
//   return {
//     contracts: [
//       { contract: sepoliaContract },
//       {
//         contract: solanaContract, config: {
//           delegate: "Ek7JmKXsKvSo2sUJL5uiYy25rge3vjhCCQgXqyrgPAph"
//         }
//       }
//     ],
//     connections
//   };
// }
