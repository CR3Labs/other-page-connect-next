import NavComponent from '@/components/nav.component';
import { SiwopButton, useSIWOP } from '@otherpage/connect-siwop';
import Link from 'next/link';
import { Fragment, useEffect } from 'react';
import { Unity, useUnityContext } from "react-unity-webgl";

export default function UnityView() {
  const { appUrl, isSignedIn, clientId, data } = useSIWOP();

  const openAccount = () => {
    const left = (window.innerWidth / 2) - 400;
    const top = (window.innerHeight / 2) - 380;
    window.open(`${appUrl}/connect/settings?client_id=${clientId}`, "mozillaWindow", `left=${left},top=${top},width=800,height=760`)
  };

  const handleUnload = () => {
    unload();
  };

  const { unityProvider, loadingProgression, isLoaded, sendMessage, unload } = useUnityContext({
    loaderUrl: "https://pub-1523f60170dc4a4a82365b22f9adba59.r2.dev/dashbored/dashbored.loader.js",
    dataUrl: "https://pub-1523f60170dc4a4a82365b22f9adba59.r2.dev/dashbored/dashbored.data",
    frameworkUrl: "https://pub-1523f60170dc4a4a82365b22f9adba59.r2.dev/dashbored/dashbored.framework.js",
    codeUrl: "https://pub-1523f60170dc4a4a82365b22f9adba59.r2.dev/dashbored/dashbored.wasm",
  });

  useEffect(() => {
    // DEV: example of sending wallet address to Unity through Controller
    sendMessage("Web3Controller", "WalletChanged", data?.address || '');
  }, [isLoaded])

  useEffect(() => {
    if (isLoaded) {
      sendMessage("Web3Controller", "WalletChanged", data?.address || '');
    }
  }, [data])

  return (
    <main className="bg-neutral-300">
      <NavComponent active="unity" />
      <div className="h-screen flex justify-center items-center">
        <Fragment>
          {!isSignedIn && (
            <div className="flex flex-col items-center gap-2">
              <img className="w-[400px]" src="https://vora.xyz/_next/image?url=%2Fimg%2Flogo-dashbored.png&w=2048&q=75" />
              <SiwopButton showAvatar={true} showSignOutButton={isSignedIn} />
            </div>
          )}
          {isSignedIn && !isLoaded && (<div className="text-lg mb-6 font-medium"><LoadingProgress progress={loadingProgression} /></div>)}
          {isSignedIn && <Unity unityProvider={unityProvider} className="w-screen h-[calc(100vh-80px)] absolute top-[80px]" />}
        </Fragment>
      </div>
    </main>
  );
}


function LoadingProgress({ progress }: { readonly progress: number }) {
  return (
    <div className='absolute flex size-full flex-col items-center justify-center gap-6 p-4'>
      <div className='mx-4 box-content h-3 w-80 max-w-full border border-white'>
        <div className='h-3 bg-white' style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}