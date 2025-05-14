import { CreateKeyPairCommand } from "@aws-sdk/client-ec2";
import { EC2ClientSingleton } from "../../lib/ec2";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";

type ToolHandler = (
  args: { keyName: string },
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

/**
 * Creates a new EC2 key pair in AWS.
 */
export const createKeyPair: ToolHandler = async (args, extra) => {
  try {
    const ec2Client = EC2ClientSingleton.getInstance();
    const { keyName } = args;

    // Create a new key pair with the provided name
    const createCommand = new CreateKeyPairCommand({
      KeyName: keyName,
    });

    const createResponse = await ec2Client.send(createCommand);

    if (createResponse.KeyMaterial) {
      const formattedKeyMaterial = createResponse.KeyMaterial.replace(
        /\\n|\+/g,
        "",
      ).trim();

      console.log(formattedKeyMaterial);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "success",
                message: `Key pair "${keyName}" created successfully. Here is the ssh private key, save it in a .pem file.`,
                keyName: keyName,
                keyMaterial: formattedKeyMaterial,
              },
              null,
              2,
            ),
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "warning",
                message: `Key pair "${keyName}" created, but no key material was returned`,
                keyName: keyName,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "error",
              message: `Failed to create key pair: ${error instanceof Error ? error.message : String(error)}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
};
