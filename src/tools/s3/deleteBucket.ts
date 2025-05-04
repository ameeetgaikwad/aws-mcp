import { DeleteBucketCommand } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";

type ToolHandler = (args: { bucketName: string }) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const deleteS3Bucket: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new DeleteBucketCommand({
      Bucket: args.bucketName,
    });

    await s3Client.send(command);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully deleted bucket: ${args.bucketName}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting S3 bucket: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
