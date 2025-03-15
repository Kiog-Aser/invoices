'use client';

interface NicheSelectorProps {
  niches: Array<{ id: string; name: string }>;
  selectedNiche?: string;
  onNicheSelect: (nicheId: string) => void;
}

export default function NicheSelector({ niches, selectedNiche, onNicheSelect }: NicheSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      <button
        onClick={() => onNicheSelect('')}
        className={`btn btn-sm ${!selectedNiche ? 'btn-primary' : 'btn-ghost'}`}
      >
        All Industries
      </button>
      {niches.map((niche) => (
        <button
          key={niche.id}
          onClick={() => onNicheSelect(niche.id)}
          className={`btn btn-sm ${selectedNiche === niche.id ? 'btn-primary' : 'btn-ghost'}`}
        >
          {niche.name}
        </button>
      ))}
    </div>
  );
}