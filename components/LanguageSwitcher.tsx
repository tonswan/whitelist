import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ current, onChange }) => {
  return (
    <div className="flex gap-2 p-1 bg-gray-800 rounded-lg inline-flex">
      {Object.values(Language).map((lang) => (
        <button
          key={lang}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card clicks if nested
            onChange(lang);
          }}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            current === lang 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
