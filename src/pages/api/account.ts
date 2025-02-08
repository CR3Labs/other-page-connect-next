import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import { siwopServer } from '@/utils/siwopServer';
import { jwtDecode } from '@/utils/jwt-decode';

// Create a Redis client
// const redis = new Redis(`rediss://default:${process.env.REDIS_PASS}@thankful-beetle-60647.upstash.io:6379`);
const redis = new Redis(process.env.REDIS_URL as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'GET') {

    // validate the session by retrieving the current users session
    const session = await siwopServer.getSession(req, res);
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // decode session accessToken
      const decoded = jwtDecode(session.accessToken);

        // get users idToken
        const idToken = await redis.get(`op_token:${decoded.sub}`);
        if (!idToken) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // decode token
        const decodedIdToken = jwtDecode(idToken);
        if (!decodedIdToken) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        res.status(200).json({
            idToken,
            account: decodedIdToken,
        });
    } catch (error: any) {
      console.log(error);
      res.status(401).json({ error: 'Session expired' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
