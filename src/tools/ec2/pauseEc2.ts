/**
 * Pause an EC2 instance in AWS.   
 * 
 */

import { EC2ClientSingleton } from "../../lib/ec2";
import { StopInstancesCommand } from "@aws-sdk/client-ec2";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types";

type StopEC2InstanceArgs = {
    instanceId: string;
};

type StopEC2InstanceToolHandler = (args: StopEC2InstanceArgs, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

export const stopEC2Instance: StopEC2InstanceToolHandler = async (args, extra) => {
    const ec2Client = EC2ClientSingleton.getInstance();

    const stopCommand = new StopInstancesCommand({
        InstanceIds: [args.instanceId],
    });

    try {
        await ec2Client.send(stopCommand);    
        return {
            content: [{ type: "text", text: "EC2 instance stopped successfully" }],
        };
    } catch (error) {
        return {
            content: [{ type: "text", text: "Error stopping EC2 instance" }],
        };
    }
};  




