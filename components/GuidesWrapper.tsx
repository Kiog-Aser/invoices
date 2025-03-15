'use client';

import { useState } from 'react';
import NicheSelector from './NicheSelector';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GuidesWrapper({ 
  children, 
  niches 
}: { 
  children: React.ReactNode;
  niches: Array<{ id: string; name: string }>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState(searchParams.get('niche') || '');

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId);
    const url = nicheId ? `?niche=${nicheId}` : '';
    router.push(`/guides${url}`);
  };

  return (
    <>
      <NicheSelector
        niches={niches}
        selectedNiche={selectedNiche}
        onNicheSelect={handleNicheSelect}
      />
      {children}
    </>
  );
}