import '@/styles/globals.css';
import { siwopClient } from '@/utils/siwopClient';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/app-provider';

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
      <QueryClientProvider client={queryClient}>
        <siwopClient.Provider appUrl={process.env.NEXT_PUBLIC_APP_URL}>
            <Component {...pageProps} />
        </siwopClient.Provider>
      </QueryClientProvider>
    
  );
}

function MyApp(appProps: AppProps) {
  return (
    <AppProvider>
      <App {...appProps} />
    </AppProvider>
  );
}

export default MyApp;
