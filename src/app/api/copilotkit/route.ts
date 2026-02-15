import { mastra } from "@/mastra"; // the path to your Mastra instance
import { MastraAgent } from "@ag-ui/mastra";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: Promise.resolve(
    MastraAgent.getLocalAgents({
      mastra,
      resourceId: 'crew-lodge-copilot',
    })
  ),
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
