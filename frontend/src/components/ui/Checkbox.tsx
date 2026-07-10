interface CheckboxProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-4 h-4 border-2 border-gray-300 rounded transition-all duration-200 peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-[#1a4a6e] peer-checked:to-[#2d8bae] group-hover:border-gray-400 peer-checked:group-hover:opacity-90" />
        {checked && (
          <svg className="absolute w-[10px] h-[10px] text-white pointer-events-none" fill="none" viewBox="0 0 12 12">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </label>
  );
}
