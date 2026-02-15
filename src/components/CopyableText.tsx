'use client';

import { useState } from 'react';
import { CopyButton } from './ui/shadcn-io/copy-button';

interface CopyableTextProps {
  text: string;
  variant?: 'ghost' | 'default';
}

export default function CopyableText({ text }: CopyableTextProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      console.error('Error copying text', error);
    }
  };

  return (
    <div
      className="group flex-1 min-w-0 flex flex-row items-start gap-2 cursor-pointer"
      onClick={handleCopy}
    >
      <span className="text-sm text-slate-900 dark:text-slate-100 flex-1 min-w-0 break-all">
        {text}
      </span>
      <CopyButton
        onCopy={() => handleCopy()}
        variant="ghost"
        content={text}
        className="shrink-0 mt-0.5 group-hover:scale-110 group-hover:text-primary transition-all duration-200"
        isCopied={isCopied}
        onCopyChange={setIsCopied}
        onClick={e => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}
