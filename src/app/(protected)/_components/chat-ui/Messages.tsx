import { useCopilotMessagesContext } from '@copilotkit/react-core';
import {
  Markdown,
  type AssistantMessageProps,
  type MessagesProps,
  type UserMessageProps,
} from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { Loader } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const UserMessage = ({ message }: UserMessageProps) => {
  const content = message?.content?.toString() || '';

  return (
    <div className="my-0 flex w-full justify-end animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="max-w-[80%] rounded-xl bg-blue-600 px-4 py-2 shadow-sm transition-all hover:bg-blue-700 dark:bg-blue-700">
        <p className="whitespace-pre-wrap wrap-break-words leading-relaxed text-white">
          {content}
        </p>
      </div>
    </div>
  );
};

export const AssistantMessage = ({
  message,
  isLoading,
}: AssistantMessageProps) => {
  const content = message?.content?.toString() || '';
  const hasContent = content.length > 0;

  // If there's no content AND !loading -> don't render anything
  if (!hasContent && !isLoading) return null;

  return (
    <div className="group my-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-2xl  px-4 py-2 transition-all dark:border-gray-800 dark:bg-gray-900">
        {/* Case 1: Display the message content (including streams) */}
        {hasContent ? (
          <div className="prose prose-sm max-w-none text-gray-800 dark:prose-invert dark:text-gray-200">
            <Markdown content={content} />
          </div>
        ) : (
          /* Case 2: Display loading state ONLY if there is no content yet */
          isLoading && (
            <div className="flex items-center gap-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Assistant is thinking...</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/**
 * Custom Messages component with auto-scroll functionality.
 * Automatically scrolls to the bottom when new messages are added or when messages are streaming.
 * This wraps the default CopilotKit messages rendering and adds scroll behavior.
 */
export const Messages = (props: MessagesProps) => {
  const { messages } = useCopilotMessagesContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated after message changes
    const timeoutId = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <>
      {/* Render the messages - props.children contains the default messages rendering */}
      {props.children}
      {/* Dummy element at the bottom to scroll to */}
      <div ref={messagesEndRef} />
    </>
  );
};
