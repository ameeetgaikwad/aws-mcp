import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";

export  type ToolHandler = (args: {}, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => Promise<{
    content: { type: "text"; text: string; }[];
}>;


export type InboundRule = {
    protocol: string;
    fromPort: number;
    toPort: number;
    cidrIp: string;
};

export type CreateSecurityGroupArgs = {
    name: string;
    description: string;
    inboundRules: InboundRule[];
};
