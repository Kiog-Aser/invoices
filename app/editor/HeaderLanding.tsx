import Link from 'next/link';
import Image from 'next/image';
import ButtonSignin from '@/components/ButtonSignin';

// Simple config for app name (customize as needed)
const appName = 'CreatiFun';

const links = [
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

const HeaderLanding = () => {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-30">
      <nav className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon128.png" alt="CreatiFun logo" width={32} height={32} className="rounded" />
          <span className="font-bold text-lg text-gray-900">{appName}</span>
        </Link>
        {/* Links */}
        <div className="hidden md:flex gap-8">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-indigo-600 font-medium transition">
              {link.label}
            </Link>
          ))}
        </div>
        {/* CTA */}
        <div className="hidden md:block">
          <ButtonSignin className="bg-indigo-600 text-white px-5 py-2 rounded font-semibold shadow hover:bg-indigo-700 transition" text="Get Started" />
        </div>
      </nav>
    </header>
  );
};

export default HeaderLanding;
