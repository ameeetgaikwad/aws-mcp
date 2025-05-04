/**
 * Delete an EC2 instance in AWS.
 *
 */

import { EC2ClientSingleton } from "../../lib/ec2";
import { TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { ServerRequest } from "@modelcontextprotocol/sdk/types";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { ServerNotification } from "@modelcontextprotocol/sdk/types";

type DeleteEC2InstanceArgs = {
  instanceId: string;
};

type DeleteEC2InstanceToolHandler = (
  args: DeleteEC2InstanceArgs,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const deleteEC2Instance: DeleteEC2InstanceToolHandler = async (
  args,
  extra,
) => {
  const ec2Client = EC2ClientSingleton.getInstance();

  const deleteCommand = new TerminateInstancesCommand({
    InstanceIds: [args.instanceId],
  });

  try {
    await ec2Client.send(deleteCommand);
    return {
      content: [{ type: "text", text: "EC2 instance deleted successfully" }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: "Error deleting EC2 instance" }],
    };
  }
};
