'use client'

import { ConnectButton } from '@otherpage/connect';
import { SiwopButton, useSIWOP } from '@otherpage/connect-siwop';
import { Fragment, useEffect, useState } from 'react';

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

    if (!data?.sub) return;
      
    fetch(`/api/avatar/${data.sub}`).then(res => res.json()).then(avatar => {
      const loadout = avatar?.loadouts?.find((l: any) => l.type === 'threejs');
      if (loadout) {
        setMML(loadout?.model);
      }
      if (avatar) {
        setName(avatar.name);
        setBadges(avatar.badges?.sort((a: any, b: any) => b.slotId - a.slotId)?.map((b: any) => b.badge));
      }
    })
  }, [isSignedIn, wt, data, name]);

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-screen relative flex-col dark:bg-neutral-200">
      <div className="flex justify-between bg-white p-4 border-b border-neutral-200">
        <nav className="flex gap-2 items-center">
          <Link href="/"><button onClick={handleUnload} className="text-lg dark:text-black hover:border-neutral-500 border px-3 py-1 rounded-md">Home</button></Link>
          <Link href="/wallet"><button onClick={handleUnload} className="text-lg dark:text-black hover:border-neutral-500 border px-3 py-1 rounded-md">Wallet</button></Link>
          <Link href="/mml"><button onClick={handleUnload} className="text-lg dark:text-black border-neutral-400 border px-3 py-1 rounded-md">MML</button></Link>
          <Link href="/unity"><button onClick={handleUnload} className="text-lg dark:text-black hover:border-neutral-400 border px-3 py-1 rounded-md">Unity</button></Link>
        </nav>
        <div className="flex items-center">
          <SiwopButton showAvatar={true} showSignOutButton={isSignedIn} />
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
                <div className="w-[160px]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 180" fill="none">
                    <path d="M269 50V114H323V130H253V50H269Z" fill="black"/>
                    <path d="M173 50L197 82.5L221 50H237V130H221V77L197 109L173 77V130H157V50H173Z" fill="black"/>
                    <path d="M77 50L101 82.5L125 50H141V130H125V77L101 109L77 77V130H61V50H77Z" fill="black"/>
                    <path d="M47.282 11L56.282 26.5885L18.8564 89.7654L54.8564 152.119L45.5 167.913L0.499996 89.9711L47.282 11Z" fill="black"/>
                    <path d="M384.621 46.6399L393.799 46.537L398.299 54.3312L351.517 133.302L342.339 133.405L337.841 125.614L384.621 46.6399Z" fill="black"/>
                    <path d="M414.851 11L423.851 26.5885L459.851 88.9423L413.069 167.913L404.069 152.325L441.495 89.1481L405.495 26.7942L414.851 11Z" fill="black"/>
                  </svg>
                </div>
                <SiwopButton showAvatar={true} showSignOutButton={isSignedIn} />
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
