"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "How do notifications help increase conversions?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>NotiFast notifications work in several ways to boost conversions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Social proof notifications show real-time activity</li>
          <li>FOMO triggers create urgency</li>
          <li>Targeted messages catch visitors at the right moment</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Is it a subscription?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>No, NotiFast uses a simple one-time payment model:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Free plan: Always free for 1 website</li>
          <li>Pro plan: One-time $10 payment for unlimited websites</li>
          <li>No recurring fees or hidden charges</li>
          <li>Includes all future updates</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How easy is it to set up?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Setup takes less than 5 minutes:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Add your website in the dashboard</li>
          <li>Create your notifications</li>
          <li>Copy one line of code to your site's {'<head>'} tag</li>
          <li>That's it! Your notifications will start showing immediately</li>
        </ol>
      </div>
    ),
  },
  {
    question: "What websites is NotiFast compatible with?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>NotiFast works with any website where you can add custom code, including:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>E-commerce platforms: Shopify, WooCommerce, Magento</li>
          <li>Website builders: Webflow, Wix, Squarespace</li>
          <li>Custom websites: React, Next.js, Vue, Angular</li>
          <li>No-code tools: Bubble, Framer, Carrd</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Will notifications slow down my website?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>No, NotiFast is designed for optimal performance:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Lightweight script ({"<"}10KB)</li>
          <li>Loads asynchronously - won't block your page</li>
          <li>Uses efficient caching</li>
          <li>Content delivered via fast CDN</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Can I customize the notifications?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        With the Pro plan, you get full customization options:
        <ul className="list-disc list-inside space-y-1">
          <li>Multiple notification themes</li>
          <li>Optional Loop functionality</li>
          <li>Custom URL support</li>
          <li>Optional Close Button</li>
        </ul>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="collapse collapse-arrow bg-base-100">
      <input 
        type="checkbox" 
        checked={isOpen} 
        onChange={() => setIsOpen(!isOpen)}
      />
      <div className="collapse-title text-xl font-medium">
        {item?.question}
      </div>
      <div className="collapse-content">
        <div className="pt-2 text-base-content/80">
          {item?.answer}
        </div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="text-4xl font-bold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2 space-y-4">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
