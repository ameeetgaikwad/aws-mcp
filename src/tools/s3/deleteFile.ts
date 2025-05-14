import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";

type ToolHandler = (args: { bucketName: string; key: string }) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const deleteFileFromS3: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new DeleteObjectCommand({
      Bucket: args.bucketName,
      Key: args.key,
    });

    await s3Client.send(command);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully deleted file s3://${args.bucketName}/${args.key}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting file from S3: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
