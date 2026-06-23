import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "airh-founder-dashboard-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_git_status",
        description: "Analyzes recent commits and diffs in the local workspace",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "read_mood_journal",
        description: "Retrieves the latest mood entries from the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "scan_workspace",
        description: "Reads specific files like README.md or changelogs from the workspace",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "read_git_status":
      return {
        content: [
          {
            type: "text",
            text: "Placeholder: Git status is clean.",
          },
        ],
      };

    case "read_mood_journal":
      return {
        content: [
          {
            type: "text",
            text: "Placeholder: User is feeling productive today.",
          },
        ],
      };

    case "scan_workspace":
      return {
        content: [
          {
            type: "text",
            text: "Placeholder: Workspace scanned successfully. Found README.md.",
          },
        ],
      };

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIRH Founder Dashboard MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
