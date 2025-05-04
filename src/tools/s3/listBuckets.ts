import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";

type ToolHandler = (args: {}) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const listS3Buckets: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    const buckets =
      response.Buckets?.map((bucket) => ({
        Name: bucket.Name,
        CreationDate: bucket.CreationDate,
      })) ?? [];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(buckets, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error listing S3 buckets: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
