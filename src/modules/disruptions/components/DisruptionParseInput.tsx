'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { logger } from '@/utils/logger';

const SubmitButton = ({ inProgress }: { inProgress: boolean }) => {
  const controller = usePromptInputController();
  const hasText = Boolean(controller.textInput.value?.trim());

  const status: 'submitted' | 'streaming' | 'ready' | 'error' = inProgress
    ? 'streaming'
    : 'ready';

  return (
    <PromptInputSubmit
      className="bg-linear-to-r from-blue-500 to-purple-500 text-white"
      disabled={!hasText && status === 'ready'}
      status={status}
    />
  );
};

interface DisruptionParseInputProps {
  inProgress?: boolean;
  onSend: (text: string) => void;
}

/**
 * Input for describing a disruption to auto-fill the form via AI parse.
 * Used in DisruptionSheet for the "AI parse" flow.
 */
export function DisruptionParseInput({
  inProgress = false,
  onSend,
}: DisruptionParseInputProps) {
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }

    onSend(message.text);
    logger.info('Submitting disruption parse', { message: message.text });
  };

  return (
    <PromptInputProvider>
      <PromptInput
        globalDrop
        multiple
        onSubmit={handleSubmit}
        className="flex-1 min-w-0"
      >
        <PromptInputBody>
          <PromptInputTextarea
            className="bg-white dark:bg-gray-900"
            placeholder="e.g. Flight delayed 9 hours in Denver INTL, need rooms for 8 crew"
          />
        </PromptInputBody>
        <PromptInputFooter className="bg-white dark:bg-gray-900">
          <SubmitButton inProgress={inProgress} />
        </PromptInputFooter>
      </PromptInput>
    </PromptInputProvider>
  );
}
