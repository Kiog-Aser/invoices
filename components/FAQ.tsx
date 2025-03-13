"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "Is it a subscription?",
    answer: <div className="space-y-2 leading-relaxed">Nope. You pay once and it's yours forever.</div>,
  },
  {
    question: "Is it compatible with...?",
    answer: (
      <p>
        Wordpress, Shopify, Carrd, Webflow, Bubble, Wix, etc. are all supported. If you can add a code snippet (script) to your website, you can use NotiFast.
      </p>
    ),
  },
  {
    question: "Do I need to code?",
    answer: (
      <div className="space-y-2 leading-relaxed">You don't. All you need to do is copy and paste a small code snippet in your website's {'<head>'} tag. Wordpress, Shopify, Webflow, Bubble, Wix, etc. are all supported.</div>
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
