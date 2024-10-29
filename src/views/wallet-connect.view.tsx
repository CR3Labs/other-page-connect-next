'use client'

import { useAppContext } from '@/contexts/app-provider';
import { ConnectButton } from '@otherpage/connect';
import { useSIWOP } from '@otherpage/connect-siwop';
import Link from 'next/link';
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
    <main className="flex min-h-[calc(100vh-80px)] w-screen relative flex-col dark:bg-neutral-200">
      <div className="flex justify-between bg-white p-4 border-b border-neutral-200">
        <nav className="flex gap-2 items-center">
          <Link href="/"><button className="text-lg dark:text-black hover:border-neutral-500 border px-3 py-1 rounded-md">Home</button></Link>
          <Link href="/wallet"><button className="text-lg dark:text-black border-neutral-500 border px-3 py-1 rounded-md">Wallet</button></Link>
          <Link href="/mml"><button className="text-lg dark:text-black hover:border-neutral-400 border px-3 py-1 rounded-md">MML</button></Link>
          <Link href="/unity"><button className="text-lg dark:text-black hover:border-neutral-400 border px-3 py-1 rounded-md">Unity</button></Link>
        </nav>
        <div className="flex items-center">
        <ConnectButton />
        {isSignedIn && <button className="bg-neutral-900 text-white rounded-md p-3 ml-1 text-sm" onClick={openAccount}>
          Account
          </button>}
        </div>
      </div>
      <div className="absolute items-start left-4 top-24 border rounded-lg border-neutral-300">
        <div className="font-medium text-center bg-neutral-300 text-black rounded-t-lg p-2 w-full">Connect Modal Theme</div>
        <div className="p-4 flex flex-col gap-4">
          <button
            onClick={toggleMode}
            className={`shadow p-2 rounded-md ${mode === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
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
      <div className="flex justify-center min-h-[calc(100vh-80px)] w-screen">
        <div className="w-full rounded-lg flex justify-center items-center flex-col">
          <Fragment>
            {!isSignedIn && (
              <div className="flex flex-col items-center gap-4">
                <img src="https://cdn.other.page/op-logo-black.png"/>
                <div className="text-md mb-6 font-medium">Other Page Connect + Wallet Connect</div>
                <ConnectButton />
              </div>
            )}
            {isSignedIn && (<div>
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
