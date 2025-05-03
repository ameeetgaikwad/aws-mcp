import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  installNginx,
  installNode,
  installPm2,
  setUpNginx,
} from "./tools/initialize";
import { z } from "zod";
import { tryCatch } from "./common/try-catch";

// Create an MCP server
const server = new McpServer({
  name: "mcp-test",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "delete-ec2-instance",
  "Deletes an EC2 instance in AWS.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: `EC2 instance deleted` }],
    };
  },
);

server.tool("install-node", "Installs Node.js on the server.", {}, async () => {
  const result = await tryCatch(installNode());
  if (result.error) {
    return {
      content: [
        { type: "text", text: `Node.js installation failed: ${result.error}` },
      ],
    };
  }
  return {
    content: [{ type: "text", text: `Node.js installed` }],
  };
});

server.tool("install-pm2", "Installs PM2 on the server.", {}, async () => {
  const result = await tryCatch(installPm2());
  if (result.error) {
    return {
      content: [
        { type: "text", text: `PM2 installation failed: ${result.error}` },
      ],
    };
  }
  return {
    content: [{ type: "text", text: `PM2 installed` }],
  };
});

server.tool("install-nginx", "Installs Nginx on the server.", {}, async () => {
  const result = await tryCatch(installNginx());
  if (result.error) {
    return {
      content: [
        { type: "text", text: `Nginx installation failed: ${result.error}` },
      ],
    };
  }
  return {
    content: [{ type: "text", text: `Nginx installed` }],
  };
});

server.tool(
  "setup-nginx",
  "Sets up Nginx on the server.",
  { domain: z.string(), port: z.string() },
  async (data) => {
    const result = await tryCatch(setUpNginx(data.domain, data.port));
    if (result.error) {
      return {
        content: [
          { type: "text", text: `Nginx setup failed: ${result.error}` },
        ],
      };
    }
    return {
      content: [{ type: "text", text: `Nginx setup` }],
    };
  },
);

server.tool(
  "create-ec2-instance",
  "Creates an EC2 instance in AWS.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: `EC2 instance created` }],
    };
  },
);

server.tool(
  "show-aws-account",
  "Shows the AWS account for the user.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: `AWS Account: 1234567890` }],
    };
  },
);

// // Start receiving messages on stdin and sending messages on stdout
main();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
