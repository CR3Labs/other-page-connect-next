import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import axios from 'axios';

// Create a Redis client
const redis = new Redis(`rediss://default:${process.env.REDIS_PASS}@thankful-beetle-60647.upstash.io:6379`);

type DataResponse = {
  data?: any;
  error?: string;
};

const API_URL = 'https://alpha-api.other.page/v1';

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
      // fetch token from Redis
      const token = await redis.get('op_token');

      if (token === null) {
        return res.status(404).json({ error: 'Data not found' });
      }

      const data = await getAvatar(token);

      // Send response with the data from the external API
      res.status(200).json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}