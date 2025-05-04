import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { EC2ClientSingleton } from "../../lib/ec2";

type ToolHandler = (
  args: {},
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const listEC2Instances: ToolHandler = async (args, extra) => {
  const ec2Client = EC2ClientSingleton.getInstance();

  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    const instances =
      response.Reservations?.flatMap(
        (reservation) =>
          reservation.Instances?.map((instance) => ({
            InstanceId: instance.InstanceId,
            State: instance.State?.Name,
            Type: instance.InstanceType,
            PublicIP: instance.PublicIpAddress,
            PrivateIP: instance.PrivateIpAddress,
            LaunchTime: instance.LaunchTime,
          })) ?? [],
      ) ?? [];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(instances, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error listing EC2 instances: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
