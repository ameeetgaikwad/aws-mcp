import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAWSAccount } from "./tools/awsAccount";
import { listEC2Instances } from "./tools/ec2/listEc2Instance";
import { z } from "zod";
import { createEC2InstanceWithParams } from "./tools/ec2/createEc2Instance";
import { getSecyrityGroups } from "./tools/securityGroups/getSecrutiyGroups";
import { createVpc } from "./tools/vpc/createVpc";
import { getSubnetId } from "./tools/subnet/getSubnetId";
import { createSecurityGroup } from "./tools/securityGroups/createSecurityGroups";
import { editSecurityGroup } from "./tools/securityGroups/editSecurityGroups";
import { stopEC2Instance } from "./tools/ec2/pauseEc2";
import { deleteEC2Instance } from "./tools/ec2/deleteEc2";
import { getKeyPairs } from "./tools/keypairs/getKeyPairs";
import { createKeyPair } from "./tools/keypairs/createKeyPair";
import { listS3Buckets } from "./tools/s3/listBuckets";
import { createS3Bucket } from "./tools/s3/createBucket";
import { uploadFileToS3 } from "./tools/s3/uploadFile";
import { downloadFileFromS3 } from "./tools/s3/downloadFile";
import { deleteFileFromS3 } from "./tools/s3/deleteFile";
import { deleteS3Bucket } from "./tools/s3/deleteBucket";
import { listS3Objects } from "./tools/s3/listObjects";

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
  "Creates an EC2 instance in AWS. This returns the type of instance created like a t2.micro, t2.small, etc. It also returns the AMI ID type used like ubuntu, amazon-linux, etc. Before creating the instance confirm with the user the key pair used and the name of the instance. Mention all the requirements in bullet points.",
  {
    instanceName: z.string().describe("The name of the EC2 instance"),
    region: z.string().describe("AWS region to create the EC2 instance in"),
    instanceType: z.string().describe("The type of EC2 instance to create"),
    amiId: z.string().describe("The AMI ID to use for the EC2 instance. By default it will use the latest Ubuntu 24.04 LTS AMI."),
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

/**
 * Get all key pairs from AWS.
 */
server.tool(
  "get-key-pairs",
  "Retrieves all EC2 key pairs from AWS. List all the key pairs and ask the user to select one. These key pairs names will be returned to the user.",
  {},
  getKeyPairs,
);

/**
 * Create a key pair in AWS or get existing ones.
 */
server.tool(
  "create-key-pair",
  "Creates a new EC2 key pair in AWS. Always ask the user for the name of the keypair to be created. This will generate a private key for access to the EC2 instance. This key will be returned to the user",
  {
    keyName: z.string().describe("Name for the new key pair."),
  },
  createKeyPair,
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

/**
 * Get subnet ID using VPC ID
 */
server.tool(
  "get-subnet-id",
  "Retrieves a subnet ID associated with the provided VPC ID",
  {
    vpcId: z.string().describe("The VPC ID to find subnet ID for"),
  },
  async (args: { vpcId: string }, extra) => {
    return getSubnetId(args, extra);
  },
);

// S3 Tools
server.tool(
  "list-s3-buckets",
  "Lists all S3 buckets in the AWS account.",
  {},
  listS3Buckets,
);

server.tool(
  "create-s3-bucket",
  "Creates a new S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket to create"),
    region: z
      .string()
      .optional()
      .describe("The AWS region to create the bucket in (optional)"),
  },
  createS3Bucket,
);

server.tool(
  "delete-s3-bucket",
  "Deletes an S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket to delete"),
  },
  deleteS3Bucket,
);

server.tool(
  "list-s3-objects",
  "Lists all objects in an S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket"),
  },
  listS3Objects,
);

server.tool(
  "upload-file-to-s3",
  "Uploads a file to an S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket"),
    key: z
      .string()
      .describe("The key (path) where the file will be stored in S3"),
    filePath: z.string().describe("The local path of the file to upload"),
    contentType: z
      .string()
      .optional()
      .describe("The content type of the file (optional)"),
  },
  uploadFileToS3,
);

server.tool(
  "download-file-from-s3",
  "Downloads a file from an S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket"),
    key: z.string().describe("The key (path) of the file in S3"),
    filePath: z
      .string()
      .describe("The local path where the file will be downloaded"),
  },
  downloadFileFromS3,
);

server.tool(
  "delete-file-from-s3",
  "Deletes a file from an S3 bucket.",
  {
    bucketName: z.string().describe("The name of the S3 bucket"),
    key: z.string().describe("The key (path) of the file to delete in S3"),
  },
  deleteFileFromS3,
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
