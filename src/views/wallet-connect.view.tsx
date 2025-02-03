'use client'

import NavComponent from '@/components/nav.component';
import { useAppContext } from '@/contexts/app-provider';
import { ConnectButton } from '@otherpage/connect';
import { useSIWOP } from '@otherpage/connect-siwop';
import { Fragment, useEffect, useState } from 'react';

  
export default function WalletConnectView() {
  const { toggleMode, handleSetPrimaryColor, mode, primaryColor } =
    useAppContext();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetPrimaryColor(e.target.value as `#${string}`);
  };
  const { idToken, appUrl, clientId, isSignedIn, data } = useSIWOP();
  const [wt, setWt] = useState<any>(new Date().getTime());
  const [avatar, setAvatar] = useState<any>(null);

  const openAccount = () => {
    const left = (window.innerWidth / 2) - 400;
    const top = (window.innerHeight / 2) - 380;
    const win = window.open(`${appUrl}/connect/settings?client_id=${clientId}`, "mozillaWindow", `left=${left},top=${top},width=800,height=760`)
    var timer = setInterval(function() { 
        if(win?.closed) {
            console.log(win);
            clearInterval(timer);
            setWt(new Date().getTime());
        }
    }, 1000);
  };

  useEffect(() => {
    setAvatar(null);

    if (!data?.sub) return;
      
    fetch(`/api/avatar/${data.sub}`).then(res => res.json()).then(avatar => {
      if (avatar) {
        console.log(avatar);
        setAvatar(avatar);
      }
    })
  }, [isSignedIn, data, wt, idToken]);

  return (
    <main className="flex min-h-[100vh] w-screen relative flex-col dark:bg-neutral-200">
      <NavComponent active="wallet" />
      <div className="flex justify-center min-h-[100vh] w-screen">
        <div className="border rounded-lg p-4" style={{ borderColor: 'black !important', margin: '10px' }}>
          <div style={{ color: 'black'}} className="font-medium text-center rounded-t-lg p-2 w-full ">Connect Modal Theme</div>
          <div className="p-4 flex flex-col gap-4">
            <button
              onClick={toggleMode}
              style={{ backgroundColor: mode === 'dark' ? 'black' : 'white', color: mode === 'dark' ? 'white' : 'black' }}
              className={`shadow p-2 rounded-md`}
            >
              Mode: {mode}
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="color" className="dark:text-black">Primary Color:</label>
              <input
                type="color"
                className="cursor-pointer"
                id="color"
                value={primaryColor}
                onChange={handleColorChange}
              />
            </div>
          </div>
        </div>
        <div className="w-full rounded-lg flex justify-center items-center flex-col">
          <Fragment>
            {!isSignedIn && (
              <div className="flex flex-col items-center gap-4">
                <img src="https://cdn.other.page/op-logo-black.png"/>
                <div className="text-md mb-6 font-medium dark:text-black">Other Page Connect + Wallet Connect</div>
                <ConnectButton />
              </div>
            )}
            {isSignedIn && (<div className="dark:text-black">
              <div className="text-lg mb-6 font-medium">Connected Avatar</div>
              <div className="flex justify-start items-center gap-4">
                <img src={avatar?.token?.image} className="rounded-full w-[80px]" alt="Avatar" />
                <div className="text-xl">{avatar?.name}</div>
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <div className="text-md">Token ID: {avatar?.token?.tokenId}</div>
                <div className="text-md max-w-[200px] overflow-ellipsis overflow-hidden">{avatar?.token?.contract}</div>
              </div>
            </div>)}
          </Fragment>
        </div>
      </div>
    </main>
  );
}
