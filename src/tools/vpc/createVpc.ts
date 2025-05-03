/**
 * Create a VPC in AWS.
 */

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { EC2ClientSingleton } from "../../lib/ec2";
import { CreateVpcCommand, CreateSubnetCommand, ModifyVpcAttributeCommand, CreateInternetGatewayCommand, AttachInternetGatewayCommand } from "@aws-sdk/client-ec2";
import { ServerRequest } from "@modelcontextprotocol/sdk/types";

type CreateVpcArgs = {
    cidrBlock: string;  // e.g., "10.0.0.0/16"
    name: string;
};

type ServerNotification = {
    method: "notifications/prompts/list_changed";
    params?: {
        [key: string]: unknown;
        _meta?: { [key: string]: unknown; };
    };
};

type CreateVpcToolHandler = (args: CreateVpcArgs, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

export const createVpc: CreateVpcToolHandler = async (args, extra) => {
    const ec2Client = EC2ClientSingleton.getInstance();
    
    try {
        // Create VPC
        const createVpcCommand = new CreateVpcCommand({
            CidrBlock: args.cidrBlock,
            TagSpecifications: [{
                ResourceType: "vpc",
                Tags: [{ Key: "Name", Value: args.name }]
            }]
        });

        const vpcResponse = await ec2Client.send(createVpcCommand);
        const vpcId = vpcResponse.Vpc?.VpcId;

        if (!vpcId) {
            throw new Error('Failed to create VPC');
        }

        // Enable DNS hostnames
        const modifyVpcCommand = new ModifyVpcAttributeCommand({
            VpcId: vpcId,
            EnableDnsHostnames: { Value: true }
        });
        await ec2Client.send(modifyVpcCommand);

        // Create Internet Gateway
        const createIgwCommand = new CreateInternetGatewayCommand({
            TagSpecifications: [{
                ResourceType: "internet-gateway",
                Tags: [{ Key: "Name", Value: `${args.name}-igw` }]
            }]
        });
        const igwResponse = await ec2Client.send(createIgwCommand);
        const igwId = igwResponse.InternetGateway?.InternetGatewayId;

        if (!igwId) {
            throw new Error('Failed to create Internet Gateway');
        }

        // Attach Internet Gateway to VPC
        const attachIgwCommand = new AttachInternetGatewayCommand({
            InternetGatewayId: igwId,
            VpcId: vpcId
        });
        await ec2Client.send(attachIgwCommand);

        // Create a public subnet
        const createSubnetCommand = new CreateSubnetCommand({
            VpcId: vpcId,
            CidrBlock: args.cidrBlock.replace('/16', '/24'), // Creates a /24 subnet from the /16 VPC
            TagSpecifications: [{
                ResourceType: "subnet",
                Tags: [{ Key: "Name", Value: `${args.name}-public-subnet` }]
            }]
        });
        const subnetResponse = await ec2Client.send(createSubnetCommand);
        const subnetId = subnetResponse.Subnet?.SubnetId;

        return {
            content: [{ 
                type: "text" as const, 
                text: `VPC created successfully:
                - VPC ID: ${vpcId}
                - Internet Gateway ID: ${igwId}
                - Subnet ID: ${subnetId}
                - CIDR Block: ${args.cidrBlock}`
            }],
        };
    } catch (error: any) {
        return {
            content: [{ 
                type: "text" as const, 
                text: `Error creating VPC: ${error.message}`
            }],
        };
    }
}; 