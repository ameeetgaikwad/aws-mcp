import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3ClientSingleton } from "../../lib/s3";
import * as fs from "fs";
import { Readable } from "stream";

type ToolHandler = (
  args: {
    bucketName: string;
    key: string;
    filePath: string;
  },
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const downloadFileFromS3: ToolHandler = async (args) => {
  const s3Client = S3ClientSingleton.getInstance();

  try {
    const command = new GetObjectCommand({
      Bucket: args.bucketName,
      Key: args.key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("No body in response");
    }

    const stream = response.Body as Readable;
    const writeStream = fs.createWriteStream(args.filePath);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on("error", (err) => reject(err))
        .on("finish", () => resolve());
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully downloaded file from s3://${args.bucketName}/${args.key} to ${args.filePath}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error downloading file from S3: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
};
