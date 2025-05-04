import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";
import * as fs from "fs";

type ToolHandler = (
  args: {
    bucketName: string;
    key: string;
    filePath: string;
    contentType?: string;
  }
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const uploadFileToS3: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const fileContent = fs.readFileSync(args.filePath);

    const command = new PutObjectCommand({
      Bucket: args.bucketName,
      Key: args.key,
      Body: fileContent,
      ContentType: args.contentType,
    });

    await s3Client.send(command);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully uploaded file to s3://${args.bucketName}/${args.key}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error uploading file to S3: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
