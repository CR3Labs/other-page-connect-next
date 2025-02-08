import { configureServerSideSIWOP } from '@otherpage/connect-next-siwop';
import Redis from "ioredis"
import { jwtDecode } from './jwt-decode';

export const siwopServer = configureServerSideSIWOP({
  config: {
    audience: 'other-page-connect-next.vercel.app',
    authApiUrl: process.env.SIWOP_API_URL,
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
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  },
  options: {
    async afterToken(req, res, session, token) {
      const redis = new Redis(process.env.REDIS_URL as string);

      // persist id token
      if (token.id_token) {
        const { sub } = jwtDecode(token.id_token);
        await redis.set(`op_token:${sub}`, token.id_token);
      }
    },
  }
});
