import Link from 'next/link';
import Image from 'next/image';
import ButtonSignin from '@/components/ButtonSignin';

// Simple config for app name (customize as needed)
const appName = 'CreatiFun';

const links = [
  { href: '/editor#pricing', label: 'Pricing' },
  { href: '/editor#features', label: 'Features' },
  { href: '/editor#faq', label: 'FAQ' },
];

const HeaderLanding = () => {
  return (
    <header className="bg-base-100/80 backdrop-blur border-b border-base-content/10 sticky top-0 z-30">
      <nav className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon128.png" alt="CreatiFun logo" width={32} height={32} className="rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]" />
          <span className="font-bold text-lg font-mono">{appName}</span>
        </Link>
        {/* Links */}
        <div className="hidden md:flex gap-8">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="font-mono text-base-content/80 hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* CTA */}
        <div className="hidden md:block">
          <ButtonSignin 
            className="btn btn-sm btn-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 font-mono" 
            text="Get Started" 
          />
        </div>
      </nav>
    </header>
  );
};

export default HeaderLanding;
