import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { siwopServer } from '@/utils/siwopServer';


type DataResponse = {
  data?: any;
  error?: string;
};

const API_URL = process.env.SIWOP_API_URL;

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

    // validate the session by retrieving the current users session
    const session = await siwopServer.getSession(req, res);
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // retrieve users connected avatar
      const data = await getAvatar(session.accessToken);

      res.status(200).json(data);
    } catch (error: any) {
      console.log(error);

      // refresh token and retry request
      if (error?.status === 401 && !req.query.retry) {
        await siwopServer.refreshSession(req, res);
        req.query.retry = 'true';
        return handler(req, res);
      }

      console.error('Error:', error);

      res.status(401).json({ error: 'Session expired' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
