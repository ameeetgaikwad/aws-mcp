import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { installNginx, installNode, installPm2 } from "./tools/initialize";

// Create an MCP server
const server = new McpServer({
  name: "mcp-test",
  version: "1.0.0",
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
  await installNode();
  return {
    content: [{ type: "text", text: `Node.js installed` }],
  };
});

server.tool("install-pm2", "Installs PM2 on the server.", {}, async () => {
  await installPm2();
  return {
    content: [{ type: "text", text: `PM2 installed` }],
  };
});

server.tool("install-nginx", "Installs Nginx on the server.", {}, async () => {
  await installNginx();
  return {
    content: [{ type: "text", text: `Nginx installed` }],
  };
});

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

// async function main2() {
//   console.log("Installing Node.js");
//   await InstallNode();
//   console.log("Node.js installed");
// }

// main2();

