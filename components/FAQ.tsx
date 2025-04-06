"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What is a writing protocol?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>A writing protocol is a comprehensive content strategy framework that helps you:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Define your content niche and unique value proposition</li>
          <li>Organize your content pillars and themes</li>
          <li>Create a structured system for consistent content creation</li>
          <li>Establish your voice, tone, and messaging strategy</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Is it a subscription?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>No, we use a simple one-time payment model:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Single Protocol: One-time $39 payment for a complete protocol</li>
          <li>Unlimited Access: One-time $159 payment for unlimited protocols</li>
          <li>No recurring fees or hidden charges</li>
          <li>Includes all future updates</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How does the process work?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Creating your writing protocol is simple:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Complete our step-by-step questionnaire about your content goals</li>
          <li>Our AI analyzes your input and generates a personalized protocol</li>
          <li>Access your complete protocol in the dashboard</li>
          <li>Export, implement, and transform your content strategy</li>
        </ol>
      </div>
    ),
  },
  {
    question: "What's included in a writing protocol?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Each writing protocol includes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Niche Authority Growth System</li>
          <li>Content Pillars and Topic Ideas</li>
          <li>Content Creation Frameworks (formats, templates, examples)</li>
          <li>Content Calendar and Publishing Schedule</li>
          <li>Conversion Funnel Strategy</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How long does it take to generate a protocol?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>The process is streamlined for efficiency:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Questionnaire: 10-15 minutes to complete</li>
          <li>Standard generation: 1-2 minutes</li>
          <li>High quality generation: 2-3 minutes</li>
          <li>Your protocol is immediately available when completed</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Can I customize my writing protocol?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Yes, your protocol is fully customizable:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Add custom content types, goals, and challenges</li>
          <li>Specify lead magnets and offers for your funnel</li>
          <li>Balance between educational and promotional content</li>
          <li>Tailor the protocol to your specific audience needs</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Who is this for?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Our writing protocols are designed for:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Content creators looking to establish clear strategic direction</li>
          <li>Coaches and consultants building thought leadership</li>
          <li>Small business owners managing their own content</li>
          <li>Marketers needing to organize multi-platform content strategies</li>
          <li>Anyone struggling with content consistency or effectiveness</li>
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
