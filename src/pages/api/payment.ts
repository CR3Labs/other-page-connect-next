import { ethers } from "ethers";
import { NextApiResponse } from "next";
import { NextApiRequest } from "next";
import axios from "axios";

type PaymentIntent = {
    appId: string;
    value: string;
    chainId: string;
    tokenSymbol: string;
    expiresAt: Date;
    callBackUrl: string;
    metadata: Record<string, string>;
};

const API_URL = process.env.SIWOP_API_URL as string;
const COMMUNITY_ID = process.env.OP_COMMUNITY_ID as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {

    if (req.method === 'GET') {
        const { amount, chainId, tokenSymbol } = req.query;

        if (!amount || !chainId || !tokenSymbol) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // create payment
        const intent: PaymentIntent = {
            appId: COMMUNITY_ID,
            value: ethers.utils.parseUnits(amount.toString(), "ether").toString(),
            chainId: chainId.toString(),
            tokenSymbol: tokenSymbol.toString(),
            expiresAt: new Date(new Date().getTime() + 1000 * 60 * 5), // 5 minutes
            // in addition to webhooks configured in Portal, you can add a custom callback 
            // here that will receive the payment status and data once completed.
            callBackUrl: "http://webhook.site/761ba713-03a6-489b-bfce-943ff782b6ca",
            metadata: {
                credits: '10',
                userId: '1',
            }
        };

        const { data } = await axios.post(`${API_URL}/community/${COMMUNITY_ID}/payment`, intent, {
            headers: {
                'X-API-KEY': process.env.OP_API_KEY as string,
            },
        });

        return res.status(200).json(data);
    }

    // This is the `callBackUrl` for the paymentIntent
    // on local, we're using webhook.site (whcli) to receive the webhook events
    // and relay them to our local server - SEE: https://webhook.site/
    //
    // `whcli forward --token=yourtoken --target=http://localhost:3004/api/payment`
    //
    if (req.method === 'POST') {
        // log the webhook event
        console.log(req.body);

        // add cors headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).json({ message: 'Payment received' });
    }

    // Handle any other HTTP method
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}