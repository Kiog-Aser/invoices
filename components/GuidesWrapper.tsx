'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BsFilter } from 'react-icons/bs';

const roles = [
  { id: "marketer", name: "Marketing" },
  { id: "founder", name: "Founder" },
  { id: "product", name: "Product" }
];

const topics = [
  { id: "conversion", name: "Conversion" },
  { id: "engagement", name: "Engagement" },
  { id: "retention", name: "Retention" }
];

const segments = [
  { id: "fashion", name: "Fashion" },
  { id: "electronics", name: "Electronics" },
  { id: "beauty", name: "Beauty" },
  { id: "home-goods", name: "Home Goods" },
  { id: "food-beverage", name: "Food & Beverage" },
  { id: "tech", name: "Tech" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "entertainment", name: "Entertainment" }
];

interface FilterOption {
  id: string;
  name: string;
}

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
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [selectedSegment, setSelectedSegment] = useState(searchParams.get('segment') || '');

  const handleFilterChange = (type: 'niche' | 'role' | 'topic' | 'segment', value: string) => {
    let newParams = new URLSearchParams(searchParams.toString());
    
    // Reset page when changing filters
    newParams.delete('page');
    
    switch(type) {
      case 'niche':
        setSelectedNiche(value);
        value ? newParams.set('niche', value) : newParams.delete('niche');
        break;
      case 'role':
        setSelectedRole(value);
        value ? newParams.set('role', value) : newParams.delete('role');
        break;
      case 'topic':
        setSelectedTopic(value);
        value ? newParams.set('topic', value) : newParams.delete('topic');
        break;
      case 'segment':
        setSelectedSegment(value);
        value ? newParams.set('segment', value) : newParams.delete('segment');
        break;
    }

    router.push(`/guides?${newParams.toString()}`);
  };

  const FilterSelect = ({ 
    label, 
    options, 
    value, 
    type 
  }: { 
    label: string; 
    options: FilterOption[]; 
    value: string; 
    type: 'niche' | 'role' | 'topic' | 'segment';
  }) => (
    <div>
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <select 
        className="select select-bordered w-full"
        value={value}
        onChange={(e) => handleFilterChange(type, e.target.value)}
      >
        <option value="">All {label}s</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );

  const ActiveFilter = ({ 
    type, 
    value, 
    options 
  }: { 
    type: 'niche' | 'role' | 'topic' | 'segment'; 
    value: string; 
    options: FilterOption[];
  }) => {
    if (!value) return null;
    const option = options.find(o => o.id === value);
    if (!option) return null;

    return (
      <button 
        className="btn btn-sm btn-outline gap-2"
        onClick={() => handleFilterChange(type, '')}
      >
        {option.name}
        <span className="text-xs">×</span>
      </button>
    );
  };

  return (
    <div className="relative">
      <div className="mb-8 bg-base-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
          <BsFilter className="w-5 h-5" />
          <h2>Filter Guides</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect 
            label="Industry" 
            options={niches} 
            value={selectedNiche} 
            type="niche" 
          />
          <FilterSelect 
            label="Role" 
            options={roles} 
            value={selectedRole} 
            type="role" 
          />
          <FilterSelect 
            label="Topic" 
            options={topics} 
            value={selectedTopic} 
            type="topic" 
          />
          <FilterSelect 
            label="Segment" 
            options={segments} 
            value={selectedSegment} 
            type="segment" 
          />
        </div>

        {/* Active Filters */}
        {(selectedNiche || selectedRole || selectedTopic || selectedSegment) && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-base-content/70">Active filters:</span>
            <ActiveFilter type="niche" value={selectedNiche} options={niches} />
            <ActiveFilter type="role" value={selectedRole} options={roles} />
            <ActiveFilter type="topic" value={selectedTopic} options={topics} />
            <ActiveFilter type="segment" value={selectedSegment} options={segments} />
          </div>
        )}
      </div>

      {children}
    </div>
  );
}