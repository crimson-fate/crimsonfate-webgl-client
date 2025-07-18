/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext, Unity } from "react-unity-webgl";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";

import { Event } from "./constants/events";
import { Action, Callback, getActionAddress } from "./constants/actions";
import config from "./config";
import { CallData, uint256 } from "starknet";
import "./App.css";
import {parseEther} from "ethers"

import RocketLoader from "./components/RocketLoader";
import SEO from "./components/Seo";
function App() {
  const handleCacheControl = (url: string) => {
    if (url.match(/\.data/) || url.match(/\.bundle/)) {
      return "must-revalidate";
    }
    if (url.match(/\.mp4/) || url.match(/\.wav/)) {
      return "immutable";
    }
    return "no-store";
  };

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener,
    sendMessage,
  } = useUnityContext({
    loaderUrl: "Build/Build.loader.js",
    dataUrl: "Build/Build.data.br",
    frameworkUrl: "Build/Build.framework.js.br",
    codeUrl: "Build/Build.wasm.br",
    streamingAssetsUrl: "TemplateData",
    cacheControl: handleCacheControl,
  });
  const loadingPercentage = Math.round(loadingProgression * 100);

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const connector = connectors[0] as ControllerConnector;
  const [username, setUsername] = useState<string>();
  const [requestConnected, setRequestConnected] = useState<boolean>(false);

  const { account } = useAccount();

  useEffect(() => {
    if (!address) return;
    connector.username()?.then((n) => {
      setUsername(n);
      const json = {
        address: address,
        username: n,
      };
      console.log("connected account json", json);
      if (requestConnected) {
        console.log("requestConnected", requestConnected);
        sendMessage("WalletManager", "SetWallet", JSON.stringify(json));
      }
    });
  }, [address, connector, requestConnected, sendMessage]);

  const [devicePixelRatio, setDevicePixelRatio] = useState(
    window.devicePixelRatio
  );

  useEffect(
    function () {
      const updateDevicePixelRatio = function () {
        setDevicePixelRatio(window.devicePixelRatio);
      };
      const mediaMatcher = window.matchMedia(
        `screen and (resolution: ${devicePixelRatio}dppx)`
      );
      mediaMatcher.addEventListener("change", updateDevicePixelRatio);
      return function () {
        mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
      };
    },
    [devicePixelRatio]
  );

  const sendMessageToUnity = useCallback(
    (id: number, data: any) => {
      const json = JSON.stringify({
        id: id,
        data: data,
      });
      console.log("sendMessageToUnity", json);
      sendMessage(Callback.object, Callback.method, json);
    },
    [sendMessage]
  );

  const handleSendTransaction = useCallback(
    (unityData: any) => {
      const sendTransaction = async (unityData: any) => {
        if (!account) return;

        unityData = JSON.parse(unityData);
        let data = unityData.data;
        data = JSON.parse(data);
        // if data.calldata is Array(0) then data.calldata = []
        if (data.calldata === "Array(0)") {
          data.calldata = [];
        }
        console.log("handleSendTransaction", data);

        if (!Object.values(Action).includes(data.entrypoint)) {
          console.error("Invalid entrypoint", data.entrypoint);
          return;
        }
        const entrypoint = data.entrypoint as Action;
        if (!data.entrypoint || !data.calldata) {
          console.error("Invalid data", data);
          return;
        }

        try {
          let calldata = data.calldata;
          try {
            calldata = JSON.parse(data.calldata);

            if (calldata.signature) {
              calldata.signature = JSON.parse(calldata.signature);
            }

            if (calldata.point) {
              calldata.point = JSON.parse(calldata.point);
            }

            if (typeof calldata.saltNonce === "string") {
              calldata.saltNonce = parseInt(calldata.saltNonce, 10);
            }

            if (calldata.amount) {
              console.log("calldata.amount", calldata.amount);
              calldata.amount = uint256.bnToUint256(parseEther(calldata.amount));
              console.log("calldata.amount after", calldata.amount);
            }

            if (calldata.saltNonce === 123 || calldata.saltNonce === 1234) {
              calldata.saltNonce = new Date().getTime();
            }

            if (typeof calldata.key === "string") {
              try {
                calldata.key = JSON.parse(calldata.key);
                if (calldata.key[0] === "1") {
                  calldata.key = ["123", "456"];
                }
              } catch {
                calldata.key = ["123", "456"];
              }
            }
          } catch (err) {
            console.error("Failed to parse calldata", err);
            calldata = [];
          }
          console.log("calldata", calldata);

          let result = null;
          if (
            entrypoint === Action.receive_skill ||
            entrypoint === Action.receive_angel_or_evil ||
            entrypoint === Action.start_new_game ||
            entrypoint === Action.accept_or_ignore_evil_skill ||
            entrypoint === Action.bribe_valor ||
            entrypoint === Action.open_chest
          ) {
            console.log("Requesting random number for entrypoint", entrypoint);
            result = await account.execute([
              {
                contractAddress: config().VRF_PROVIDER_ADDRESS,
                entrypoint: Action.request_random,
                calldata: CallData.compile({
                  caller: getActionAddress(entrypoint),
                  source: { type: 0, address: account.address },
                }),
              },
              {
                contractAddress: getActionAddress(entrypoint),
                entrypoint: entrypoint,
                calldata: CallData.compile(calldata),
              },
            ]);
          } if (
            entrypoint === Action.request_valor
          ) {
            console.log("Requesting valor for entrypoint", entrypoint);
            // switch calldata.duration == 2 then set amount = 1000, 4 then 3000, 8 then 10000
            const amount = calldata.duration === 2 ? 1000 : calldata.duration === 4 ? 3000 : 10000;
            console.log("amount: ", amount);
            result = await account.execute([
              {
                contractAddress: config().gemTokenContract, // gem token contract
                entrypoint: 'approve',
                calldata: CallData.compile({
                  spender: '0x07b123e848c57f3200032d6bd992cecb9f33d62a906cb5b65c5dd8220bd6b27c', // vault contract
                  amount: uint256.bnToUint256(parseEther(amount.toString())), // amount tùy theo duration 1000 | 3000 | 10000
                }),
              },
              {
                contractAddress: getActionAddress(entrypoint),
                entrypoint: entrypoint,
                calldata: CallData.compile(calldata),
              },
            ]);
          } else {
            result = await account.execute([
              {
                contractAddress: getActionAddress(entrypoint),
                entrypoint: entrypoint,
                calldata: CallData.compile(calldata),
              },
            ]);
          }

          console.log("Transaction hash:", result.transaction_hash);
          sendMessageToUnity(unityData.id, "");
        } catch (e) {
          sendMessageToUnity(unityData.id, String(e));
        } finally {
          console.log("Finally");
          // if (entrypoint === Action.start_new_game) {
          //   sendMessage(
          //     Callback.object,
          //     Callback.method,
          //     "success"
          //   );
          // }
        }
      };
      sendTransaction(unityData);
    },
    [account, sendMessageToUnity]
  );

  const handleSignMessage = useCallback(
    (unityData: any) => {
      const signMessage = async (unityData: any) => {
        if (!account) return;

        unityData = JSON.parse(unityData);
        let data = unityData.data;
        data = JSON.parse(data);
        console.log("handleSignMessage", data);

        try {
          const result = await account.signMessage(data);
          const jsonString = JSON.stringify(result);
          console.log("Signature:", jsonString);
          sendMessageToUnity(unityData.id, jsonString);
        } catch (e) {
          sendMessageToUnity(unityData.id, String(e));
        }
      };
      signMessage(unityData);
    },
    [account, sendMessageToUnity]
  );

  const handleConnectWallet = useCallback(() => {
    setRequestConnected(true);
    connect({ connector: connector });
    console.log("handle connect wallet");
    if (address && isConnected) {
      console.log("address", address);
      connector.username()?.then((n) => setUsername(n));
      // const json = {
      //   address: address,
      //   username: username,
      // };
      // sendMessage("WalletManager", "SetWallet", JSON.stringify(json));
    }
  }, [address, isConnected, connect, connector, sendMessage, username]);

  const handleClearSessionButton = useCallback(() => {
    disconnect();
    // window.location.reload();
  }, [disconnect]);

  const handleOpenProfile = useCallback(
    () => {
      if (!connector?.controller) {
        console.error("Controller not initialized");
        return;
      }
      connector.controller.openProfile("inventory");
    },
    [connector]
  );

  useEffect(() => {
    addEventListener(Event.ConnectWallet, handleConnectWallet);
    return () => {
      removeEventListener(Event.ConnectWallet, handleConnectWallet);
    };
  }, [addEventListener, removeEventListener, handleConnectWallet]);

  useEffect(() => {
    addEventListener(Event.OpenProfile, handleOpenProfile);
    return () => {
      removeEventListener(Event.OpenProfile, handleOpenProfile);
    };
  }, [addEventListener, removeEventListener, handleOpenProfile]);

  useEffect(() => {
    addEventListener(Event.Logout, handleClearSessionButton);
    return () => {
      removeEventListener(Event.Logout, handleClearSessionButton);
    };
  }, [addEventListener, removeEventListener, handleClearSessionButton]);

  useEffect(() => {
    addEventListener(Event.ExecuteAction, handleSendTransaction);
    return () => {
      removeEventListener(Event.ExecuteAction, handleSendTransaction);
    };
  }, [addEventListener, removeEventListener, handleSendTransaction]);

  useEffect(() => {
    addEventListener(Event.SignMessage, handleSignMessage);
    return () => {
      removeEventListener(Event.SignMessage, handleSignMessage);
    };
  }, [addEventListener, removeEventListener, handleSignMessage]); 
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <SEO
        title="Crimsonfate"
        description="Onchain Game In Starknet"
        image={"https://crimsonfate.starkarcade.com/banner.png"}
        siteName="Crimsonfate"
        url="https://crimsonfate.starkarcade.com"
      />
      <div
        className="container"
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        {isLoaded === false && (
          <>
            <button
              className="floating-button"
              onClick={() => disconnect()}
              style={{ fontFamily: "FredokaOne" }}
            >
              Disconnect
            </button>
            <RocketLoader />
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${loadingPercentage}%` }}
              />
              <span className="progress-label">{loadingPercentage}%</span>
            </div>
          </>
        )}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            WebkitOverflowScrolling: "touch",
            touchAction: "auto",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            display: "flex",
            zIndex: 0,
          }}
        >
          <Unity
            id="game-unity"
            unityProvider={unityProvider}
            devicePixelRatio={devicePixelRatio}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>
      </div>
    </>
  );
}
export default App;
