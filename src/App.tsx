/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUnityContext, Unity } from "react-unity-webgl";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import ControllerConnector from "@cartridge/connector/controller";

import { Event } from "./constants/events";
import { Action, Callback } from "./constants/actions";
import config from "./config";
import { CallData } from "starknet";
import "./App.css";

import RocketLoader from "./components/RocketLoader";

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
  const controller = connectors[0] as ControllerConnector;
  const [username, setUsername] = useState<string>();
  const [requestConnected, setRequestConnected] = useState<boolean>(false);

  const { account } = useAccount();

  useEffect(() => {
    if (!address) return;
    controller.username()?.then((n) => {
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
  }, [address, controller]);

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

  const sendMessageToUnity = (id: number, data: any) => {
    const json = JSON.stringify({
      id: id,
      data: data,
    });
    console.log("sendMessageToUnity", json);
    sendMessage(Callback.object, Callback.method, json);
  };

  const handleSendTransaction = useCallback(
    (unityData: any) => {
      const sendTransaction = async (data: any) => {
        if (!account) return;

        unityData = JSON.parse(unityData);
        var data = unityData.data;
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

            if (calldata.key) {
              calldata.key = [];
            }

            if (calldata.saltNonce) {
              calldata.saltNonce = new Date().getTime();
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
            entrypoint === Action.accept_or_ignore_evil_skill
          ) {
            result = await account.execute([
              {
                contractAddress: config().VRF_PROVIDER_ADDRESS,
                entrypoint: Action.request_random,
                calldata: CallData.compile({
                  caller: config().actionAddress,
                  source: { type: 0, address: account.address },
                }),
              },
              {
                contractAddress: config().actionAddress,
                entrypoint: entrypoint,
                calldata: CallData.compile(calldata),
              },
            ]);
          } else {
            result = await account.execute([
              {
                contractAddress: config().actionAddress,
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
    [account]
  );

  const handleConnectWallet = () => {
    setRequestConnected(true);
    connect({ connector: controller });
    console.log("handle connect wallet");
    if (address && isConnected) {
      console.log("address", address);
      controller.username()?.then((n) => setUsername(n));
      const json = {
        address: address,
        username: username,
      };
      sendMessage("WalletManager", "SetWallet", JSON.stringify(json));
    }
  };

  const handleClearSessionButton = () => {
    disconnect();
    // window.location.reload();
  };

  useEffect(() => {
    addEventListener(Event.ConnectWallet, handleConnectWallet);
    return () => {
      removeEventListener(Event.ConnectWallet, handleConnectWallet);
    };
  }, [addEventListener, removeEventListener, handleConnectWallet]);

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;

      if (container) {
        container.style.height = `${window.innerHeight}px`;
        container.style.width = `${window.innerWidth}px`;
      }

      const canvas = document.getElementById("game-unity");
      if (canvas) {
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
      }
    };

    updateSize();

    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", () =>
      setTimeout(updateSize, 300)
    );

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);
  return (
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
  );
}
export default App;
