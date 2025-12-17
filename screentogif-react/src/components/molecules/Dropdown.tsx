import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from 'react';
import { Icon } from '../atoms/Icon';

export type DropdownSize = 'sm' | 'md' | 'lg';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

export interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  size?: DropdownSize;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

const sizeStyles: Record<DropdownSize, string> = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

export function Dropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  size = 'md',
  disabled = false,
  searchable = false,
  className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      inputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery, isOpen]);

  const handleSelect = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case ' ':
        if (!searchable) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-surface-200 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          ${sizeStyles[size]}
          w-full flex items-center justify-between gap-2
          bg-surface-800 text-surface-100
          border border-surface-600 rounded-lg
          hover:border-surface-500
          focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={selectedOption ? 'text-surface-100' : 'text-surface-500'}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <Icon
          name="chevron-down"
          size="sm"
          className={`text-surface-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-1 w-full
            bg-surface-800 rounded-lg border border-surface-700
            shadow-lg animate-fade-in overflow-hidden
          "
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-surface-700">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="
                  w-full h-8 px-3
                  bg-surface-700 text-surface-100
                  placeholder:text-surface-500
                  rounded text-sm
                  focus:outline-none focus:ring-1 focus:ring-primary-500/50
                "
              />
            </div>
          )}

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-surface-500 text-center">
                No options found
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    px-3 py-2 cursor-pointer
                    flex items-center gap-2
                    transition-colors duration-100
                    ${option.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : highlightedIndex === index
                        ? 'bg-surface-700'
                        : 'hover:bg-surface-700'
                    }
                    ${option.value === value ? 'bg-primary-600/20' : ''}
                  `}
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-surface-100 truncate">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-surface-500 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <Icon name="check" size="sm" className="text-primary-500 flex-shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
