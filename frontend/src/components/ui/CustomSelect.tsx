import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Option {
    value: string;
    label: string;
    className?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Pilih...', className = '' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full flex items-center justify-between px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                style={{
                    background: 'var(--surface-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)'
                }}
            >
                <span className={!selectedOption ? 'opacity-50' : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 border rounded-xl shadow-lg overflow-hidden"
                        style={{
                            background: 'var(--surface-dropdown)',
                            borderColor: 'var(--border-subtle)'
                        }}
                    >
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${option.className || ''}`}
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check className="w-4 h-4 text-blue-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
