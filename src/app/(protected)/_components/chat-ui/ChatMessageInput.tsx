'use client';

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';
import { InputProps } from '@copilotkit/react-ui';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

const models = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
  },
];

const SubmitButton = ({ inProgress }: { inProgress: boolean }) => {
  const controller = usePromptInputController();
  const hasText = Boolean(controller.textInput.value?.trim());

  // Derive status from inProgress prop
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

interface ChatMessageInputProps extends InputProps {
  modelSelector: boolean;
  className?: string;
}
const ChatMessageInput = ({
  inProgress,
  onSend,
  modelSelector = true,
  className,
}: ChatMessageInputProps) => {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const selectedModelData = models.find(m => m.id === model);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }

    //TODO: Add context to Mastra when file search mode is enabled or web search mode is enabled

    onSend(message.text);

    // eslint-disable-next-line no-console
    logger.info('Submitting message', { message: message.text });
  };

  return (
    <PromptInputProvider>
      <PromptInput
        globalDrop
        multiple
        onSubmit={handleSubmit}
        className={cn(className)}
      >
        <PromptInputBody>
          <PromptInputTextarea className="bg-white dark:bg-gray-900" />
        </PromptInputBody>
        <PromptInputFooter className="bg-white dark:bg-gray-900">
          <PromptInputTools className="flex flex-row gap-2">
            {modelSelector && (
              <ModelSelector
                onOpenChange={setModelSelectorOpen}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.chefSlug && (
                      <ModelSelectorLogo
                        provider={selectedModelData.chefSlug}
                        className="size-5"
                      />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>
                        {selectedModelData.name}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {['OpenAI', 'Google'].map(chef => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {models
                          .filter(m => m.chef === chef)
                          .map(m => (
                            <ModelSelectorItem
                              key={m.id}
                              onSelect={() => {
                                setModel(m.id);
                                setModelSelectorOpen(false);
                              }}
                              value={m.id}
                            >
                              <ModelSelectorLogo
                                provider={m.chefSlug}
                                className="size-5"
                              />

                              <ModelSelectorName>{m.name}</ModelSelectorName>
                              <ModelSelectorLogoGroup>
                                {m.providers.map(provider => (
                                  <ModelSelectorLogo
                                    className="size-5"
                                    key={provider}
                                    provider={provider}
                                  />
                                ))}
                              </ModelSelectorLogoGroup>
                              {model === m.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            )}
          </PromptInputTools>
          <SubmitButton inProgress={inProgress} />
        </PromptInputFooter>
      </PromptInput>
    </PromptInputProvider>
  );
};

export default ChatMessageInput;
