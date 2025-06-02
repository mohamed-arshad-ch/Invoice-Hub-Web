import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

interface SearchableSelectProps {
  items?: any[];
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  displayKey?: string;
  valueKey?: string;
  searchKeys?: string[];
  disabled?: boolean;
  clearable?: boolean;
  maxHeight?: string;
  emptyMessage?: string;
  className?: string;
  error?: boolean;
  errorMessage?: string;
}

const SearchableSelect = ({
  items = [],
  value = null,
  onChange = () => {},
  placeholder = "Search and select...",
  displayKey = "name",
  valueKey = "id",
  searchKeys = ["name"],
  disabled = false,
  clearable = true,
  maxHeight = "200px",
  emptyMessage = "No items found",
  className = "",
  error = false,
  errorMessage = ""
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        searchKeys.some(key => 
          item[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredItems(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, items, searchKeys]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
            handleSelectItem(filteredItems[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredItems]);

  const handleSelectItem = (item: any) => {
    onChange(item);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const selectedItem = value ? items.find(item => item[valueKey] === value[valueKey]) : null;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Main Input Container */}
      <div
        className={`
          relative flex items-center min-h-[40px] px-3 py-2 
          bg-slate-800 border rounded-lg cursor-pointer transition-all duration-200
          ${error ? 'border-red-500' : 'border-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
        `}
        onClick={handleInputClick}
      >
        {/* Selected Value or Search Input */}
        {isOpen ? (
          <div className="flex items-center flex-1">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 outline-none"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="flex items-center flex-1">
            {selectedItem ? (
              <span className="text-slate-100">{selectedItem[displayKey]}</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
        )}

        {/* Right Icons */}
        <div className="flex items-center space-x-1">
          {clearable && selectedItem && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
            </button>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50"
          style={{ maxHeight }}
        >
          <div className="overflow-auto" style={{ maxHeight }} ref={listRef}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={item[valueKey]}
                  onClick={() => handleSelectItem(item)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors flex items-center justify-between
                    ${highlightedIndex === index ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-100'}
                    ${selectedItem && selectedItem[valueKey] === item[valueKey] ? 'bg-slate-700' : ''}
                  `}
                >
                  <span>{item[displayKey]}</span>
                  {selectedItem && selectedItem[valueKey] === item[valueKey] && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-slate-400 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  );
};

export default SearchableSelect;