import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types";
import { EC2Client, RunInstancesCommand, RunInstancesCommandInput, _InstanceType, VolumeType } from "@aws-sdk/client-ec2";
import { promptForEC2Config, EC2UserConfig } from './configPrompt';
import { EC2ClientSingleton } from "../../lib/ec2";

type ToolHandler = (args: {}, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

type EC2ToolHandler = (args: EC2UserConfig, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

export async function createEC2Instance(config: EC2UserConfig) {
  const client = EC2ClientSingleton.getInstance();

  // Prepare the instance configuration
  const instanceParams: RunInstancesCommandInput = {
    ImageId: config.amiId,
    InstanceType: config.instanceType as _InstanceType,
    MinCount: 1,
    MaxCount: 1,
    KeyName: config.keyName,
    SecurityGroupIds: config.securityGroupIds,
    SubnetId: config.subnetId,
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: [
          {
            Key: 'Name',
            Value: config.instanceName
          }
        ]
      }
    ],
    BlockDeviceMappings: [
      {
        DeviceName: '/dev/xvda', // Root volume
        Ebs: {
          VolumeSize: config.volumeSize || 8,
          VolumeType: (config.volumeType || 'gp2') as VolumeType,
          DeleteOnTermination: true,
        },
      },
    ],
  };

  // Add tags if provided
  if (config.tags) {
    instanceParams.TagSpecifications = [
      {
        ResourceType: 'instance',
        Tags: Object.entries(config.tags).map(([Key, Value]) => ({ Key, Value })),
      },
    ];
  }

  try {
    const command = new RunInstancesCommand(instanceParams);
    const response = await client.send(command);
    
    return {
      success: true,
      instanceId: response.Instances?.[0]?.InstanceId,
      instanceDetails: response.Instances?.[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export const createEC2InstanceInteractive: ToolHandler = async (args, extra) => {
  try {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "info",
            message: "To create an EC2 instance, please provide the following required parameters:\n" +
              "1. instanceType (e.g., t2.micro, t2.small)\n" +
              "2. amiId (e.g., ami-12345678)\n" +
              "\nOptional parameters:\n" +
              "3. keyName (for SSH access)\n" +
              "4. securityGroupIds (comma-separated)\n" +
              "5. subnetId\n" +
              "6. volumeSize (in GB, default: 8)\n" +
              "7. volumeType (default: gp2)\n" +
              "8. tags (key-value pairs)"
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "error",
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ]
    };
  }
};

export const createEC2InstanceWithParams: EC2ToolHandler = async (args, extra) => {
  try {
    // Type guard to check if a key exists in args
    const hasParam = (param: keyof EC2UserConfig): boolean => {
      return args[param] !== undefined && args[param] !== null;
    };

    // Required parameters for EC2 instance creation
    const requiredParams: (keyof EC2UserConfig)[] = [
      'instanceName',
      'instanceType',
      'amiId',
      'keyName',
      'volumeSize',
      'volumeType'
    ];

    // Check if all required parameters are present
    const missingParams = requiredParams.filter(param => !hasParam(param));
    
    if (missingParams.length > 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              error: `Missing required parameters: ${missingParams.join(', ')}`
            }, null, 2)
          }
        ]
      };
    }

    const result = await createEC2Instance(args);
    
    if (result.success) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              instanceId: result.instanceId,
              details: result.instanceDetails
            }, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              error: result.error
            }, null, 2)
          }
        ]
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "error",
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ]
    };
  }
};
