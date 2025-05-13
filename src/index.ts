import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAWSAccount } from "./tools/awsAccount";
import { listEC2Instances } from "./tools/ec2/listEc2Instance";
import { z } from "zod";
import { createEC2InstanceWithParams } from "./tools/ec2/createEc2Instance";
import { getSecyrityGroups } from "./tools/securityGroups/getSecrutiyGroups";
import { createVpc } from "./tools/vpc/createVpc";
import { createSecurityGroup } from "./tools/securityGroups/createSecurityGroups";
import { editSecurityGroup } from "./tools/securityGroups/editSecurityGroups";
import { stopEC2Instance } from "./tools/ec2/pauseEc2";
import { deleteEC2Instance } from "./tools/ec2/deleteEc2";

import {
  installNode,
  installPm2,
  installNginx,
  setupNginx,
  setupGithubSSHKeys,
  installGithub,
} from "./tools/ec2Setup";
import { logger } from "./services/logger";

type ServerNotification = {
  method: "notifications/prompts/list_changed";
  params?: {
    [key: string]: unknown;
    _meta?: { [key: string]: unknown };
  };
};

// Create an MCP server
const server = new McpServer({
  name: "mcp-test",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

/**
 * Install Node.js on ec2 instance.
 */
server.tool(
  "install-node",
  "Installs Node.js on ec2 instance.",
  {},
  installNode,
);

/**
 * Install pm2 on ec2 instance.
 */
server.tool("install-pm2", "Installs pm2 on ec2 instance.", {}, installPm2);

/**
 * Install nginx on ec2 instance.
 */
server.tool(
  "install-nginx",
  "Installs nginx on ec2 instance.",
  {},
  installNginx,
);

/**
 * Setup nginx on ec2 instance.
 */
server.tool(
  "setup-nginx",
  "Setup nginx on ec2 instance.",
  {
    domain: z
      .string()
      .optional()
      .describe(
        "Domain name for HTTPS and SSL certificate configuration. Optional - leave empty if HTTPS is not needed.",
      ),
    port: z
      .string()
      .describe(
        "The port which your server is running on. Always ask the user for the port number.",
      ),
  },
  setupNginx,
);

/**
 * Setup github ssh keys on ec2 instance for setting up github.
 */
server.tool(
  "setup-github-ssh-keys",
  "Setup github ssh keys on ec2 instance. This will generate a new ssh key pair and add it to the ec2 instance. The public key will also be returned to the user for adding to github.",
  {
    email: z
      .string()
      .optional()
      .describe(
        "The email address to use for the github ssh keys. Ask the user for the email address.",
      ),
  },
  setupGithubSSHKeys,
);

/**
 * Clone a github repository on ec2 instance.
 */
server.tool(
  "clone-github-repository",
  "Clone a github repository on ec2 instance.",
  {
    githubUrl: z.string().describe("The URL of the github repository to clone"),
  },
  installGithub,
);

/**
 * Get the security groups for the EC2 instance
 */
server.tool(
  "get-security-groups",
  "Get the security groups for the EC2 instance",
  {},
  getSecyrityGroups,
);
/**
 * Create an EC2 instance in AWS.
 */
server.tool(
  "create-ec2-instance",
  "Creates an EC2 instance in AWS.",
  {
    instanceName: z.string().describe("The name of the EC2 instance"),
    region: z.string().describe("AWS region to create the EC2 instance in"),
    instanceType: z.string().describe("The type of EC2 instance to create"),
    amiId: z.string().describe("The AMI ID to use for the EC2 instance"),
    keyName: z.string().describe("The key name to use for the EC2 instance"),
    securityGroupIds: z
      .array(z.string())
      .describe("The security group IDs to use for the EC2 instance"),
    subnetId: z.string().describe("The subnet ID to use for the EC2 instance"),
    volumeSize: z
      .number()
      .describe("The size of the volume to use for the EC2 instance"),
    volumeType: z
      .string()
      .describe("The type of volume to use for the EC2 instance"),
  },
  createEC2InstanceWithParams,
);

/**
 * Show the AWS account for the user.
 */
server.tool(
  "show-aws-account",
  "Shows the AWS account for the user.",
  {},
  getAWSAccount,
);

/**
 * Pause an EC2 instance in AWS.
 */
server.tool(
  "stop-ec2-instance",
  "Stops an EC2 instance in AWS.",
  {
    instanceId: z.string().describe("The ID of the EC2 instance to stop"),
  },
  stopEC2Instance,
);

/**
 * Delete an EC2 instance in AWS.
 */
server.tool(
  "delete-ec2-instance",
  "Deletes an EC2 instance in AWS.",
  {
    instanceId: z.string().describe("The ID of the EC2 instance to delete"),
  },
  deleteEC2Instance,
);
/**
 * List all EC2 instances in AWS.
 */
server.tool(
  "list-all-ec2-instances",
  "Lists all EC2 instances in AWS.",
  {},
  listEC2Instances,
);

server.tool(
  "create-security-group",
  "Create a security group in AWS",
  {
    name: z.string().describe("Name of the security group"),
    description: z.string().describe("Description for the security group"),
    inboundRules: z
      .array(
        z.object({
          protocol: z.string(),
          fromPort: z.number(),
          toPort: z.number(),
          cidrIp: z.string(),
        }),
      )
      .describe("List of inbound rules"),
  },
  createSecurityGroup,
);

server.tool(
  "edit-security-group",
  "Edit a security group in AWS",
  {
    groupId: z.string().describe("The ID of the security group to edit"),
    inboundRules: z
      .array(
        z.object({
          protocol: z.string(),
          fromPort: z.number(),
          toPort: z.number(),
          cidrIp: z.string(),
        }),
      )
      .describe("List of inbound rules"),
  },
  editSecurityGroup,
);

/**
 * Create a VPC in AWS
 */
server.tool(
  "create-vpc",
  "Creates a VPC in AWS with necessary networking components",
  {
    cidrBlock: z
      .string()
      .describe("The CIDR block for the VPC (e.g., '10.0.0.0/16')"),
    name: z.string().describe("Name tag for the VPC"),
  },
  async (args: { cidrBlock: string; name: string }, extra) => {
    return createVpc(args, extra);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("AWS MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
