'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { PostHogProvider } from '../components/PostHogProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <SessionProvider refetchInterval={0}>
        <Toaster position="bottom-center" />
        {children}
      </SessionProvider>
    </PostHogProvider>
  );
}