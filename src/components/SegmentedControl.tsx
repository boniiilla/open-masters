'use client';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`stream-segmented ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`stream-segmented-option ${value === option ? 'stream-segmented-option-active' : ''}`}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
