import { configureServerSideSIWOP } from '@otherpage/connect-next-siwop';
import Redis from "ioredis"

export const siwopServer = configureServerSideSIWOP({
  config: {
    audience: 'other-page-connect-next.vercel.app',
    clientId: process.env.NEXT_PUBLIC_SIWOP_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_SIWOP_REDIRECT_URI,
    clientSecret: process.env.SIWOP_CLIENT_SECRET,
    scope: [
      'openid',
      'profile',
      'email',
      'avatar.read',
      'wallets.read',
      'twitter.read',
      'discord.read',
      'tokens.read',
      'communities.read',
    ].join(' '), // Your SIWOP scopes
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
      const redis = new Redis(`rediss://default:${process.env.REDIS_PASS}@thankful-beetle-60647.upstash.io:6379`);
      // const redis = new Redis(`redis://localhost:6379`);
      await redis.set(`op_token:${session.account.id}`, token.access_token);
      await redis.set(`op_refresh_token:${session.account.id}`, token.refresh_token);
    },
  }
});
