import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import axios, { Axios, AxiosError } from 'axios';

// Create a Redis client
const redis = new Redis(`rediss://default:${process.env.REDIS_PASS}@thankful-beetle-60647.upstash.io:6379`);
// const redis = new Redis(`redis://localhost:6379`);

type DataResponse = {
  data?: any;
  error?: string;
};

const API_URL = 'https://alpha-api.other.page/v1';

async function refreshToken(uid: string) {
  const token = await redis.get(`op_refresh_token:${uid}`);

  const { data } = await axios.post(`${API_URL}/connect/oauth2-token`, {
    grant_type: 'refresh_token',
    client_id: process.env.NEXT_PUBLIC_SIWOP_CLIENT_ID,
    client_secret: process.env.SIWOP_CLIENT_SECRET,
    refresh_token: token,
    scope: 'avatar.read wallets.read twitter.read discord.read tokens.read communities.read',
  });

  await redis.set(`op_token:${uid}`, data.access_token);
  await redis.set(`op_refresh_token:${uid}`, data.refresh_token);
}

/**
 * Retrieve a connect users avatar
 * @param accessToken 
 * @returns 
 */
async function getAvatar(
  accessToken: string  
) {
  // Perform the POST request to the external API
  // Make an API request to another service
  const { data } = await axios.get(`${API_URL}/account/connected-avatar`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
  });

  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DataResponse>) {  
  if (req.method === 'GET') {
    try {
      const token = await redis.get(`op_token:${req.query.uid}`);

      if (token === null) {
        return res.status(404).json({ error: 'Data not found' });
      }

      const data = await getAvatar(token);

      res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      // refresh token and retry request
      if (error?.status === 401 && !req.query.retry) {
        await refreshToken(req.query.uid as string);
        req.query.retry = 'true';
        return handler(req, res);
      }

      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}