import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";
import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types";

export const getAWSCredentials = () => {
    return {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    };
};

type ToolHandler = (args: {}, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;

export const getAWSAccount: ToolHandler = async (args, extra) => {
    const credentials = getAWSCredentials();
    return {
        content: [{ type: "text" as const, text: JSON.stringify(credentials) }],
    };
};


