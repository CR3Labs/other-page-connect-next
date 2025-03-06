'use client'

import NavComponent from '@/components/nav.component';
import { useAppContext } from '@/contexts/app-provider';
import { ConnectButton } from '@otherpage/connect';
import { useSIWOP } from '@otherpage/connect-siwop';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useWriteContract, useChainId, useSwitchChain, useWatchPendingTransactions } from 'wagmi';
import paymentRouterABI from '@/utils/paymentRouter.abi.json';
import { parseGwei } from 'viem';


export default function WalletConnectView() {
  const { toggleMode, handleSetPrimaryColor, mode, primaryColor } =
    useAppContext();
  const { writeContractAsync } = useWriteContract();

  useWatchPendingTransactions({
    onTransactions: (txs) => {
      console.log(txs);
    },
  });

  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<any>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetPrimaryColor(e.target.value as `#${string}`);
  };
  const { idToken, isSignedIn, data } = useSIWOP();
  const [avatar, setAvatar] = useState<any>(null);

  const handlePayment = useCallback(async () => {
    if (chainId !== 33111) {
      await switchChainAsync({ chainId: 33111 })
    }

    setLoading(true);
    const response = await fetch('/api/payment?amount=0.01&chainId=33111&tokenSymbol=APE', {
      method: 'GET',
    });
    const intent = await response.json();

    // send a payment to the payment router contract
    try {
      const tx = await writeContractAsync({
        address: intent.paymentRouterAddress,
        abi: paymentRouterABI,
        functionName: 'pay',
        args: [
          intent.onchain.token,
          intent.onchain.value,
          intent.onchain.paymentId,
          intent.onchain.deadline,
          intent.onchain.signature,
        ],
        value: intent.onchain.value,
      });
      setTx(tx);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }, []);

  useEffect(() => {
    setAvatar(null);

    if (!data?.sub) return;

    fetch(`/api/avatar`).then(res => res.json()).then(avatar => {
      if (avatar) {
        setAvatar(avatar);
      }
    })
  }, [isSignedIn, data, idToken]);

  return (
    <main className="flex min-h-[100vh] w-screen relative flex-col dark:bg-neutral-200">
      <NavComponent active="wallet" />
      <div className="flex justify-center min-h-[100vh] w-screen">
        <div className="border rounded-lg p-4" style={{ borderColor: 'black !important', margin: '10px' }}>
          <div style={{ color: 'black' }} className="font-medium text-center rounded-t-lg p-2 w-full ">Connect Modal Theme</div>
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
                <img src="https://cdn.other.page/op-logo-black.png" />
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
              
              <div className="flex flex-col gap-1 mt-4">
                <button className="p-2 rounded-md text-white" style={{ backgroundColor: 'black' }} onClick={handlePayment}>
                  {loading ? 'Submitting...' : 'Buy 10 Credits'}
                </button>
                {tx && (
                  <a href={`https://curtis.apescan.io/tx/${tx}`} target="_blank" rel="noopener noreferrer" className="text-center w-ful">
                    View Transaction
                  </a>
                )}
                <div className="flex w-full justify-center pt-10">
                  <ConnectButton />
                </div>
              </div>
            </div>)}
          </Fragment>
        </div>
      </div>
    </main>
  );
}
