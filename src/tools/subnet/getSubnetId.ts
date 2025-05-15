import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";
import { DescribeSubnetsCommand } from "@aws-sdk/client-ec2";
import { EC2ClientSingleton } from "../../lib/ec2";

type GetSubnetIdArgs = {
  vpcId: string;
};

type ToolHandler = (
  args: GetSubnetIdArgs,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const getSubnetId: ToolHandler = async (args, extra) => {
  const ec2Client = EC2ClientSingleton.getInstance();

  try {
    const command = new DescribeSubnetsCommand({
      Filters: [
        {
          Name: "vpc-id",
          Values: [args.vpcId],
        },
      ],
    });

    const response = await ec2Client.send(command);
    const subnet = response.Subnets?.[0]; // Taking the first subnet

    if (!subnet || !subnet.SubnetId) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No subnets found for VPC ID: ${args.vpcId}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            subnetId: subnet.SubnetId,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error retrieving subnet ID: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}; 