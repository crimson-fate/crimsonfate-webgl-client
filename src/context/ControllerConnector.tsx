import { sepolia } from "@starknet-react/chains";
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
      ],
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
};

// Initialize the connector
const connector = [
  new ControllerConnector({
    policies,
    defaultChainId: constants.StarknetChainId.SN_SEPOLIA,

    chains: [
      {
        rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
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
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connector}
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  );
}
