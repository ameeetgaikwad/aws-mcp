/**
 * Get the security group for the EC2 instance  
 */
import { EC2ClientSingleton } from "../../lib/ec2";
import { ToolHandler } from "../../types/types";
import { DescribeSecurityGroupsCommand } from "@aws-sdk/client-ec2";


 export const getSecyrityGroups: ToolHandler = async(   args , extra ) => {
    const ec2Client = EC2ClientSingleton.getInstance();
    const command = new DescribeSecurityGroupsCommand({});
    const response = await ec2Client.send(command);
    return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
    };
 };
 