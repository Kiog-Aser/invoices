'use client';

import ButtonAccount from '@/components/ButtonAccount';

export default function WritingProtocolsPage() {
  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
          <ButtonAccount />
          <h1 className="text-2xl font-bold ml-4">Private Page</h1>
        </div>
      </div>
      <div className="text-center py-12 bg-base-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">This is a private page.</h2>
        <p className="text-base-content/70">Only logged-in users can see this.</p>
      </div>
    </div>
  );
}
