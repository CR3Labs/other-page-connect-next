import { configureServerSideSIWOP } from '@otherpage/connect-next-siwop';
import Redis from "ioredis"

export const siwopServer = configureServerSideSIWOP({
  config: {
    audience: 'localhost:3001',
    clientId: process.env.NEXT_PUBLIC_SIWOP_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_SIWOP_REDIRECT_URI,
    clientSecret: process.env.SIWOP_CLIENT_SECRET,
    scope: 'avatar.read wallets.read twitter.read discord.read tokens.read communities.read',
  },
  session: {
    cookieName: 'opconnect-next-siwop',
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  },
  options: {
    async afterToken(req, res, session, token) {
      const client = new Redis(`rediss://default:${process.env.REDIS_PASS}@thankful-beetle-60647.upstash.io:6379`);
      await client.set('op_token', token.access_token);
      await client.set('op_refresh_token', token.refresh_token);
    }
  }
});
