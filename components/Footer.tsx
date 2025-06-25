import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon.png";
import config from "@/config";

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src={logo} 
                alt="InvoiceLink" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-gray-900">InvoiceLink</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Stripe invoices made easy. Let your customers generate and download invoices themselves. No more manual work. No Stripe fee. No more headaches.
            </p>
            <p className="text-gray-500 text-sm">
              Copyright © 2025 - All rights reserved
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 uppercase text-sm tracking-wider">LINKS</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-600 hover:text-gray-900">Support</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-gray-900">Affiliates</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 uppercase text-sm tracking-wider">LEGAL</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tos" className="text-gray-600 hover:text-gray-900">Terms of services</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">Privacy policy</Link></li>
            </ul>
          </div>

          {/* More */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 uppercase text-sm tracking-wider">MORE</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="https://ai.milh.tech" target="_blank" className="text-gray-600 hover:text-gray-900">Free AI Course</Link></li>
              <li><Link href="https://creati.fun" target="_blank" className="text-gray-600 hover:text-gray-900">CreatiFun</Link></li>
              <li><Link href="https://talent.surf" target="_blank" className="text-gray-600 hover:text-gray-900">TalentSurf</Link></li>
              <li><Link href="https://notifast.fun" target="_blank" className="text-gray-600 hover:text-gray-900">NotiFast</Link></li>
              <li><Link href="https://github.com/Kiog-Aser/invoices" target="_blank" className="text-gray-600 hover:text-gray-900">GitHub</Link></li>
            </ul>
          </div>
        </div>

        {/* Creator section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-sm">👋</span>
            </div>
            <p className="text-gray-600 text-sm">
              Hey Curious 👋 I'm <strong>Mil</strong>, the creator of InvoiceLink. You can follow my work on{" "}
              <Link href="https://x.com/MilHoornaert" target="_blank" className="text-blue-600 underline">Twitter</Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
