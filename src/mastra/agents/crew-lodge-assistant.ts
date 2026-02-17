import { Agent } from '@mastra/core/agent';

export const crewLodgeAssistantAgent = new Agent({
  tools: {},
  id: 'crew-lodge-assistant-agent',
  name: 'Crew Lodge Assistant Agent',
  description: `The main agentic assistant for CrewLodge. 
    Will mostly be used as the main entry point for CopilotKit AG-UI chat interface.
    `,
  instructions: `You are the main agent for CrewLodge AI Application that aims to helps airlines book hotels for crew members.
`,
  model: 'openai/gpt-4o',
});
