import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  starkscan,
  publicProvider,
} from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";
import config from "../config";
import { Action } from "../constants/actions";
import { constants } from "starknet";

// Define session policies
const policies: SessionPolicies = {
  contracts: {
    [config().actionAddress]: {
      methods: [
        {
          name: "Start new game",
          entrypoint: Action.start_new_game,
          description: "Start new game",
        },
        {
          name: "Receive skill",
          entrypoint: Action.receive_skill,
          description: "Claim skill",
        },
        {
          name: "Receive skill from angel or evil",
          entrypoint: Action.receive_angel_or_evil,
          description: "Claim skill from angel or evil",
        },
        {
          name: "Select skill",
          entrypoint: Action.select_skill,
          description: "Select skill",
        },
        {
          name: "Accept or ignore evil skill",
          entrypoint: Action.accept_or_ignore_evil_skill,
          description: "Accept or ignore evil skill",
        },
        {
          name: "Update prover",
          entrypoint: Action.update_prover,
          description: "Update prover",
        },
        {
          name: "Request valor",
          entrypoint: Action.request_valor,
          description: "Request valor",
        },
        {
          name: "Bribe valor",
          entrypoint: Action.bribe_valor,
          description: "Bribe valor",
        },
        {
          name: "Claim chest",
          entrypoint: Action.claim_chest,
          description: "Claim chest",
        },
        {
          name: "Open chest",
          entrypoint: Action.open_chest,
          description: "Open chest",
        },
        {
          name: "Claim gem from valor",
          entrypoint: Action.claim_gem_from_valor,
          description: "Claim gem from valor",
        },
      ],
    },
    [config().gemAddress]: {
      methods: [
        {
          name: "Claim gem",
          entrypoint: Action.claim_gem,
          description: "Claim gem",
        },
      ]
    },
    [config().gemTokenContract]: {
      name: "Gem contract",
      description: "Gem token",
      methods: [
        {
          name: "Approve gem",
          description: "Approve a special amount of gem for game system contracts",
          entrypoint: "battle_start"
        },
      ]
    },
    ["0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f"]: {
      methods: [
        {
          name: "Request random",
          entrypoint: Action.request_random,
          description: "Request random number",
        },
      ],
    },
  },
  messages: [
    {
      name: "CrimsonFate Message Signing",
      description: "Allows signing messages for in-game authentication",
      types: {
        StarknetDomain: [
          { name: "name", type: "shortstring" },
          { name: "version", type: "shortstring" },
          { name: "chainId", type: "shortstring" },
          { name: "revision", type: "shortstring" }
        ],
        Message: [{ name: 'nonce', type: 'selector' }],
      },
      primaryType: "Message",
      domain: {
        name: "CrimsonFate",
        version: "1",
        revision: "1",
        chainId: "SN_MAIN",
      }
    }
  ]
};

// Initialize the connector
const connector = [
  new ControllerConnector({
    policies,
    defaultChainId: constants.StarknetChainId.SN_MAIN,

    chains: [
      {
        rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
      },
    ],
  }),
];

// Configure RPC provider
// const provider = jsonRpcProvider({
//   rpc: (chain: Chain) => {
//     switch (chain) {
//       case mainnet:
//         return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
//       case sepolia:
//       default:
//         return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
//     }
//   },
// });

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet]}
      provider={publicProvider()}
      connectors={connector}
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  );
}
