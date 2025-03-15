import Link from 'next/link';

export default function ActivationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <h1 className="text-4xl font-bold mb-6">Pro Plan Activated! 🎉</h1>
        <p className="text-xl mb-8">
          Your Pro plan has been successfully activated.
          You now have access to all premium features.
        </p>
        <Link 
          href="/dashboard" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </Link>
      </main>
    </div>
  );
}