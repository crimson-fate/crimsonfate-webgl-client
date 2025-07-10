import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

const InstallPWAButton: React.FC = () => {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    setIsPWAInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches
    );

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPrompt = e;

      if (!isIOS && !isPWAInstalled && !isDismissedByUser) {
        setShowInstallButton(true);
      }
      console.log("beforeinstallprompt event fired.");
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed!");
      setShowInstallButton(false);
      setIsPWAInstalled(true);
      deferredPrompt = null;
      setIsDismissedByUser(false); // Reset dismissal status if installed
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIOS, isPWAInstalled, isDismissedByUser]); // Added isDismissedByUser to dependencies

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setShowInstallButton(false);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
        setIsDismissedByUser(true);
      }
    }
  };

  const handleCloseClick = () => {
    setIsDismissedByUser(true);
    setShowInstallButton(false);
    console.log("User clicked close button.");
  };

  if (isPWAInstalled || isDismissedByUser) {
    return null;
  }

  if (isIOS) {
    return (
      <div className="p-4 bg-blue-100 text-blue-800 rounded-lg text-center mt-4 relative">
        <button
          onClick={handleCloseClick}
          className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <p className="font-semibold mb-2">Install App for Full Experience!</p>
        <p>
          On iOS, tap the <span className="font-bold">Share button</span>{" "}
          <span className="text-xl">⬆️</span> in Safari, then select "Add to
          Home Screen".
        </p>
      </div>
    );
  }

  // Only show the Android install button if beforeinstallprompt has fired
  // and it's not dismissed by the user.
  if (showInstallButton) {
    return (
      <div className="text-center mt-8 relative">
        <button
          onClick={handleCloseClick}
          className="absolute top-0 right-0 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <button
          onClick={handleInstallClick}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Install App
        </button>
      </div>
    );
  }

  return null;
};

export default InstallPWAButton;
