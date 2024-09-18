'use client'

import { useAppContext } from '@/contexts/app-provider';
import { ConnectButton, useSIWOP } from '@otherpage/connect';
import { Fragment, Suspense, useEffect, useState } from 'react';

import dynamic from 'next/dynamic'
import Link from 'next/link';
 
const DynamicMML = dynamic(() => import('../components/mml.component'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function MMLView() {
  const { appUrl, clientId, isSignedIn, data } = useSIWOP();
  const [mml, setMML] = useState<string | null>(null);
  const [wt, setWt] = useState<any>(new Date().getTime());
  const [badges, setBadges] = useState<any[]>([]);
  const [name, setName] = useState<string | null>(null);

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

  const handleUnload = () => {
    setMML(null);
  };

  useEffect(() => {
    setMML(null);

    if (!data?.uid) return;
      
    fetch(`/api/avatar/${data.uid}`).then(res => res.json()).then(avatar => {
      const loadout = avatar?.loadouts?.find((l: any) => l.type === 'threejs');
      if (loadout) {
        setMML(loadout?.model);
      }
      if (avatar) {
        setName(avatar.name);
        setBadges(avatar.badges?.sort((a: any, b: any) => b.slotId - a.slotId)?.map((b: any) => b.badge));
      }
    })
  }, [isSignedIn, wt, name]);

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-screen relative flex-col">
      <div className="flex justify-between bg-white p-4 border-b border-neutral-200">
        <nav className="flex gap-2 items-center">
          <Link href="/"><button onClick={handleUnload} className="text-lg hover:border-neutral-400 border px-3 py-1 rounded-md">Home</button></Link>
          <Link href="/mml"><button className="text-lg border-neutral-500 border px-3 py-1 rounded-md">MML</button></Link>
          <Link href="/unity"><button onClick={handleUnload}  className="text-lg hover:border-neutral-400 border px-3 py-1 rounded-md">Unity</button></Link>
        </nav>
        <div className="flex items-center">
        <ConnectButton />
        {isSignedIn && <button className="bg-neutral-900 text-white rounded-md p-3 ml-1 text-sm" onClick={openAccount}>
          Account
          </button>}
        </div>
      </div>
      <div className="flex min-h-[calc(100vh-80px)] justify-center w-screen">
        <div className="w-full rounded-lg flex justify-center items-center flex-col">
          <Fragment>
            {!isSignedIn && (
              <div className="flex flex-col items-center gap-6">
                <img src="https://mml.io/images/logo/mml-logotype-white.svg"/>
                <ConnectButton />
              </div>
            )}
            {isSignedIn && !mml && (<div className="text-lg mb-6 font-medium">No Avatar MML Model Found</div>)}
            {isSignedIn && mml && <DynamicMML name={name || ''} model={mml} badges={badges} />}
          </Fragment>
        </div>
      </div>
    </main>
  );
}
