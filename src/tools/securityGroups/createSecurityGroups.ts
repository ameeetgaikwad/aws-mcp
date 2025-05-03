/**
 * Create a security group in AWS.
 */

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { EC2ClientSingleton } from "../../lib/ec2";
import { CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand } from "@aws-sdk/client-ec2";
import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types";
import { CreateSecurityGroupArgs } from "../../types/types";
// Default VPC ID for the account
const DEFAULT_VPC_ID = "vpc-04988a53f29e99a47";

type CreateSecurityGroupToolHandler = (args: CreateSecurityGroupArgs, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

export const createSecurityGroup: CreateSecurityGroupToolHandler = async (args, extra) => {
    const ec2Client = EC2ClientSingleton.getInstance();
    
    // Create the security group
    const createCommand = new CreateSecurityGroupCommand({
        GroupName: args.name,
        Description: args.description,
        VpcId: DEFAULT_VPC_ID
    });

    try {
        const createResponse = await ec2Client.send(createCommand);
        const groupId = createResponse.GroupId;

        if (!groupId) {
            throw new Error('Failed to get security group ID');
        }

        // Add inbound rules
        const ingressCommand = new AuthorizeSecurityGroupIngressCommand({
            GroupId: groupId,
            IpPermissions: args.inboundRules.map(rule => ({
                IpProtocol: rule.protocol,
                FromPort: rule.fromPort,
                ToPort: rule.toPort,
                IpRanges: [{ CidrIp: rule.cidrIp }]
            }))
        });

        await ec2Client.send(ingressCommand);

        return {
            content: [{ 
                type: "text" as const, 
                text: `Security group ${args.name} created successfully with ID: ${groupId}`
            }],
        };
    } catch (error: any) {
        return {
            content: [{ 
                type: "text" as const, 
                text: `Error creating security group: ${error.message}`
            }],
        };
    }
};