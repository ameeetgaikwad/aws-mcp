/**
 * Edit a security group in AWS.
 */

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";
import { InboundRule } from "../../types/types";
import { EC2ClientSingleton } from "../../lib/ec2";
import { AuthorizeSecurityGroupIngressCommand } from "@aws-sdk/client-ec2";

type EditSecurityGroupArgs = {
  groupId: string;
  inboundRules: InboundRule[];
};

type EditSecurityGroupToolHandler = (
  args: EditSecurityGroupArgs,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const editSecurityGroup: EditSecurityGroupToolHandler = async (
  args,
  extra,
) => {
  const ec2Client = EC2ClientSingleton.getInstance();

  const editCommand = new AuthorizeSecurityGroupIngressCommand({
    GroupId: args.groupId,
    IpPermissions: args.inboundRules.map((rule) => ({
      IpProtocol: rule.protocol,
      FromPort: rule.fromPort,
      ToPort: rule.toPort,
      IpRanges: [{ CidrIp: rule.cidrIp }],
    })),
  });

  try {
    await ec2Client.send(editCommand);
    return {
      content: [{ type: "text", text: "Security group updated successfully" }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: "Error updating security group" }],
    };
  }
};
