'use client';

import { useState, useEffect, useRef } from 'react';

interface MathInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const MathInput = ({
  label,
  value,
  onChange,
  unit = 'px',
  step = 1,
  disabled = false,
  min,
  max,
}: MathInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);

  // Update input when external value changes (but not when focused)
  useEffect(() => {
    if (!isFocused && value !== prevValue.current) {
      setInputValue(value.toString());
      prevValue.current = value;
    }
  }, [value, isFocused]);

  const evaluateMathExpression = (expression: string, baseValue: number): number | null => {
    // Remove unit suffix if present
    const cleanExpression = expression.replace(/[a-z%]+$/gi, '').trim();

    // If it's just a number, return it
    if (!isNaN(Number(cleanExpression))) {
      return Number(cleanExpression);
    }

    // Handle mathematical operations relative to base value
    try {
      // Support +, -, *, / operations
      if (cleanExpression.startsWith('+')) {
        const addValue = Number(cleanExpression.substring(1));
        return baseValue + addValue;
      }
      if (cleanExpression.startsWith('-')) {
        const subtractValue = Number(cleanExpression.substring(1));
        return baseValue - subtractValue;
      }
      if (cleanExpression.startsWith('*')) {
        const multiplyValue = Number(cleanExpression.substring(1));
        return baseValue * multiplyValue;
      }
      if (cleanExpression.startsWith('/')) {
        const divideValue = Number(cleanExpression.substring(1));
        if (divideValue === 0) return null;
        return baseValue / divideValue;
      }

      // Try to evaluate as a direct mathematical expression
      // Note: Using Function is safer than eval, but still use with caution
      const result = Function(`'use strict'; return (${cleanExpression})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return result;
      }
    } catch (e) {
      return null;
    }

    return null;
  };

  const handleBlur = () => {
    setIsFocused(false);

    const result = evaluateMathExpression(inputValue, value);

    if (result !== null) {
      let finalValue = result;

      // Apply min/max constraints
      if (min !== undefined) finalValue = Math.max(min, finalValue);
      if (max !== undefined) finalValue = Math.min(max, finalValue);

      // Round to step precision
      if (step < 1) {
        const decimals = step.toString().split('.')[1]?.length || 0;
        finalValue = Number(finalValue.toFixed(decimals));
      } else {
        finalValue = Math.round(finalValue / step) * step;
      }

      onChange(finalValue);
      setInputValue(finalValue.toString());
      prevValue.current = finalValue;
    } else {
      // Revert to previous valid value
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      inputRef.current?.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = value + step;
      const constrainedValue = max !== undefined ? Math.min(newValue, max) : newValue;
      onChange(constrainedValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = value - step;
      const constrainedValue = min !== undefined ? Math.max(newValue, min) : newValue;
      onChange(constrainedValue);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full px-2 py-1.5 pr-8 text-xs bg-card-hover border rounded-lg focus:outline-none transition-colors font-mono ${
            disabled
              ? 'border-border-primary text-text-muted cursor-not-allowed'
              : isFocused
              ? 'border-primary'
              : 'border-border-primary hover:border-border-primary/70'
          }`}
          placeholder="0"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-medium pointer-events-none">
          {unit}
        </div>
      </div>
    </div>
  );
};
