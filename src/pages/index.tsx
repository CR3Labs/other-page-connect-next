'use client'

import { useAppContext } from '@/contexts/app-provider';
import { ConnectButton, useSIWOP } from '@otherpage/connect';
import { Fragment, Suspense, useEffect, useState } from 'react';

import dynamic from 'next/dynamic'
 
const DynamicMML = dynamic(() => import('../components/mml.component'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function Home({ address }: { address?: string }) {
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
    <main className="flex min-h-[calc(100vh-100px)] w-screen relative flex-col">
      <div className="flex justify-between bg-white p-4 border-b border-neutral-200">
        <img className="w-40" src="https://somnia.network/wp-content/uploads/2024/03/logo-somnia-footer.png" />
        <div className="flex items-center">
        <ConnectButton />
        {isSignedIn && <button className="bg-neutral-900 text-white rounded-md p-3 ml-1 text-sm" onClick={openAccount}>
          Account
          </button>}
        </div>
      </div>
      <div className="flex justify-center min-h-screen w-screen">
        <div className="h-[800px] w-full rounded-lg flex justify-center items-center flex-col">
          <Fragment>
            {!isSignedIn && (<div className="text-lg mb-6 font-medium">Log in to View</div>)}
            {isSignedIn && !mml && (<div className="text-lg mb-6 font-medium">No Avatar Model Found</div>)}
            {isSignedIn && mml && <DynamicMML name={name || ''} model={mml} badges={badges} />}
          </Fragment>
        </div>
      </div>
    </main>
  );
}
