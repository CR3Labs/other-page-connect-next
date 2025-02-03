'use client'

import NavComponent from '@/components/nav.component';
import { SiwopButton, useSIWOP } from '@otherpage/connect-siwop';
import { Fragment, useEffect, useState } from 'react';

export default function Home() {
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
      <NavComponent active="home" />
      <div className="flex justify-center min-h-[100vh] w-screen">
        <div className="w-full rounded-lg flex justify-center items-center flex-col gap-4">
          <img src="https://cdn.other.page/op-logo-black.png"/>
          <div className="text-md mb-6 font-medium dark:text-black">Default Other Page Connect</div>
          <SiwopButton showAvatar={true} showSignOutButton={isSignedIn} />
          <Fragment>
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
