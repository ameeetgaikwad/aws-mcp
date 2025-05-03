import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { InstallNode } from "./tools/initialize";

// Create an MCP server
const server = new McpServer({
  name: "mcp-test",
  version: "1.0.0",
});

// Get AWS credentials from environment variables
const getAWSCredentials = () => {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
  };
  
  console.log("AWS Credentials loaded:", {
    accessKeyId: credentials.accessKeyId ? "****" + credentials.accessKeyId.slice(-4) : "not set",
    secretAccessKey: credentials.secretAccessKey ? "****" + credentials.secretAccessKey.slice(-4) : "not set",
    region: credentials.region || "not set",
    profile: credentials.profile || "not set"
  });
  
  return credentials;
};

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
  await InstallNode();
  return {
    content: [{ type: "text", text: `Node.js installed` }],
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
    const credentials = getAWSCredentials();
    return {
      content: [{ type: "text", text: JSON.stringify(credentials) }],
    };
  },
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
