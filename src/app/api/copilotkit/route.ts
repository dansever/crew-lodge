import { mastra } from '@/mastra';
import { MastraAgent } from '@ag-ui/mastra';
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

const serviceAdapter = new ExperimentalEmptyAdapter();
const agents = MastraAgent.getLocalAgents({
  mastra,
  resourceId: 'crew-lodge-copilot',
});

const runtime = new CopilotRuntime({
  agents,
} as unknown as ConstructorParameters<typeof CopilotRuntime>[0]);

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
