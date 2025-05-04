import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const getAWSCredentials = () => {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
};

export class EC2ClientSingleton {
  private static instance: EC2Client | null = null;

  private constructor() {}

  public static getInstance(): EC2Client {
    if (!EC2ClientSingleton.instance) {
      const credentials = getAWSCredentials();
      EC2ClientSingleton.instance = new EC2Client({
        credentials: {
          accessKeyId: credentials.accessKeyId!,
          secretAccessKey: credentials.secretAccessKey!,
        },
        region: credentials.region,
      });
    }
    return EC2ClientSingleton.instance;
  }
}
