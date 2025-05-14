import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";

type ToolHandler = (args: { bucketName: string }) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const listS3Objects: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new ListObjectsV2Command({
      Bucket: args.bucketName,
    });

    const response = await s3Client.send(command);

    const objects =
      response.Contents?.map((object) => ({
        Key: object.Key,
        Size: object.Size,
        LastModified: object.LastModified,
        StorageClass: object.StorageClass,
      })) ?? [];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(objects, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error listing objects in S3 bucket: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
