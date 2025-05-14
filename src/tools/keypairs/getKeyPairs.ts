import { DescribeKeyPairsCommand } from "@aws-sdk/client-ec2";
import { EC2ClientSingleton } from "../../lib/ec2";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";

type ToolHandler = (
  args: {},
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

/**
 * Gets all EC2 key pairs from AWS.
 */
export const getKeyPairs: ToolHandler = async (args, extra) => {
  try {
    const ec2Client = EC2ClientSingleton.getInstance();

    const command = new DescribeKeyPairsCommand({});

    const response = await ec2Client.send(command);

    const keyPairNames =
      response.KeyPairs?.map((keyPair) => keyPair.KeyName) || [];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "success",
              message:
                "Here are the key pairs available in your AWS account. Ask the user to select one.",
              keypairs: keyPairNames,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to get key pairs: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
