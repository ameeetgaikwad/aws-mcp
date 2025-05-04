import { S3Client } from "@aws-sdk/client-s3";
import { getAWSCredentials } from "../aws-utils";

export class S3ClientSingleton {
  private static instance: S3Client | null = null;

  private constructor() {}

  public static getInstance(): S3Client {
    if (!S3ClientSingleton.instance) {
      const credentials = getAWSCredentials();
      S3ClientSingleton.instance = new S3Client({
        credentials: {
          accessKeyId: credentials.accessKeyId!,
          secretAccessKey: credentials.secretAccessKey!,
        },
        region: credentials.region,
      });
    }
    return S3ClientSingleton.instance;
  }
}
