import { SiwopButton, useSIWOP } from "@otherpage/connect-siwop";
import Link from "next/link";

export default function NavComponent({ active }: { active: string }) {
    const { appUrl, clientId, isSignedIn } = useSIWOP();

    const openAccount = () => {
        const left = (window.innerWidth / 2) - 400;
        const top = (window.innerHeight / 2) - 380;
        const win = window.open(`${appUrl}/connect/settings?client_id=${clientId}`, "mozillaWindow", `left=${left},top=${top},width=800,height=760`)
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 ">
            <div className="flex justify-between shadow-lg ring-1 ring-black/5 bg-black/50 backdrop-blur-lg p-2">
                <nav className="flex gap-1 items-center">
                    <Link href="/"><button className={`text-lg text-neutral-300 hover:text-neutral-100 px-3 py-1 rounded-md ${active === 'home' ? 'text-neutral-100' : ''}`}>Home</button></Link>
                    <Link href="/wallet"><button className={`text-lg text-neutral-300 hover:text-neutral-100 px-3 py-1 rounded-md ${active === 'wallet' ? 'text-neutral-100' : ''}`}>Wallet Connect</button></Link>
                    <Link href="/mml"><button className={`text-lg text-neutral-300 hover:text-neutral-100 px-3 py-1 rounded-md ${active === 'mml' ? 'text-neutral-100' : ''}`}>MML Connect</button></Link>
                    <Link href="/unity"><button className={`text-lg text-neutral-300 hover:text-neutral-100 px-3 py-1 rounded-md ${active === 'unity' ? 'text-neutral-100' : ''}`}>Unity Connect</button></Link>
                </nav>
                <div className="flex items-center">
                <SiwopButton showAvatar={true} showSignOutButton={isSignedIn} />
                {isSignedIn && <button className="bg-neutral-950 text-white rounded-md p-3 ml-1 text-sm" onClick={openAccount}>
                Account
                </button>}
                </div>
            </div>
        </div>
  );
}