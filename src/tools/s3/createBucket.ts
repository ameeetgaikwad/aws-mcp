import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";
import {
  CreateBucketCommand,
  BucketLocationConstraint,
} from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";

type ToolHandler = (
  args: { bucketName: string; region?: string },
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const createS3Bucket: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new CreateBucketCommand({
      Bucket: args.bucketName,
      CreateBucketConfiguration: args.region
        ? {
            LocationConstraint: args.region as BucketLocationConstraint,
          }
        : undefined,
    });

    await s3Client.send(command);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created bucket: ${args.bucketName}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating S3 bucket: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
