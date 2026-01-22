'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface InviteCodeModalProps {
  onSuccess: () => void;
}

export default function InviteCodeModal({ onSuccess }: InviteCodeModalProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!char) return;

    const newCode = [...code];
    newCode[index] = char[0]; // Take only first character
    setCode(newCode);
    setError(null);

    // Move to next input
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCode = [...code];
      
      if (code[index]) {
        // Clear current cell
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // Move to previous cell and clear it
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (pastedText.length >= 6) {
      const newCode = pastedText.slice(0, 6).split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      setError(null);
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter all 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid code');
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        // Store verified status
        localStorage.setItem('chainpulse_invited', 'true');
        localStorage.setItem('chainpulse_invite_code', fullCode);
        onSuccess();
      }
    } catch (err) {
      console.error('Error validating code:', err);
      setError('Failed to validate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = code.every(c => c !== '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black">
      {/* Modal */}
      <div className="relative bg-[#111111] border border-[#222] rounded-2xl p-8 sm:p-10 w-full max-w-md animate-fadeIn">
        {/* Close button - optional, disabled for invite-only */}
        {/* <button className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-white rounded-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button> */}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
          Enter Invite Code
        </h1>
        
        <p className="text-[#888] text-center mb-8">
          chainpulse is currently invite-only. Enter your code below to continue.
        </p>

        {/* Code Input */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {code.map((char, index) => (
            <div key={index} className="relative">
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`
                  w-10 h-14 sm:w-12 sm:h-16 
                  text-center text-xl sm:text-2xl font-mono font-bold
                  bg-[#0a1a0f] border-2 rounded-lg
                  text-white placeholder-[#2a4a35]
                  focus:outline-none transition-all duration-200
                  ${char ? 'border-[#22c55e]' : 'border-[#1a3a25]'}
                  ${error ? 'border-red-500/50' : ''}
                  focus:border-[#22c55e] focus:shadow-[0_0_20px_rgba(34,197,94,0.3)]
                `}
                placeholder="X"
                autoComplete="off"
                autoCapitalize="characters"
              />
              {/* Cursor indicator */}
              {index === 2 && (
                <div className="absolute top-1/2 -right-1.5 sm:-right-2 -translate-y-1/2 w-0.5 h-6 bg-[#333]" />
              )}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg
            transition-all duration-200
            ${isComplete && !loading
              ? 'bg-[#22c55e] text-black hover:bg-[#1ea54e] cursor-pointer'
              : 'bg-[#1a3a25] text-[#2a5a35] cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </span>
          ) : (
            'Continue'
          )}
        </button>

        {/* Divider */}
        <div className="my-6 border-t border-[#222]" />

        {/* Request access */}
        <p className="text-center text-[#888]">
          Need an invite?{' '}
          <a 
            href="https://x.com/justframe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#22c55e] hover:text-[#1ea54e] font-medium hover:underline"
          >
            Request access on X
          </a>
        </p>
      </div>
    </div>
  );
}
