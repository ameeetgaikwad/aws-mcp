/**
 * Setup Nginx on an EC2 instance.
 */

import { SSHService } from "../../lib/ssh";

import { NGINX_CONFIG } from "../../constants";

import { ToolHandler } from "../../types/types";
import { logger } from "../../services/logger";

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";

import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";

type SetupNginxArgs = {
  domain?: string;
  port: string;
};

type SetupNginxToolHandler = (
  args: SetupNginxArgs,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const installNginx: ToolHandler = async (args, extra) => {
  const sshService = new SSHService();

  try {
    const result = await sshService.executeCommands([
      "sudo apt install nginx && exit",
    ]);

    if (result.code !== 0) {
      throw new Error(
        `nginx installation failed with exit code ${result.code}`,
      );
    }

    // console.log("pm2 successfully installed");
    return {
      content: [
        { type: "text", text: "nginx successfully installed on ec2 instance" },
      ],
    };
  } catch (error) {
    logger.error("Failed to install nginx:", error);
    return {
      content: [{ type: "text", text: "nginx installation failed" + error }],
    };
  }
};
export const setupNginx: SetupNginxToolHandler = async (args, extra) => {
  const sshService = new SSHService();

  try {
    const sanitized = NGINX_CONFIG.replace(/'/g, `'\\''`)
      .replace("{{domain}}", args.domain ?? "")
      .replace("{{port}}", args.port.toString());

    const result = await sshService.executeCommands([
      `sudo rm /etc/nginx/nginx.conf && echo '${sanitized}' | sudo tee /etc/nginx/nginx.conf > /dev/null && sudo nginx -s reload && exit`,
      "exit",
    ]);

    if (result.code !== 0) {
      return {
        content: [
          {
            type: "text",
            text: "nginx installation failed with exit code " + result.code,
          },
        ],
      };
    }

    return {
      content: [
        { type: "text", text: "nginx successfully installed on ec2 instance" },
      ],
    };
  } catch (error) {
    logger.error("Failed to install nginx:", error);
    return {
      content: [{ type: "text", text: "nginx installation failed" + error }],
    };
  }
};

// async function main() {
//   const result = await installNginx({}, undefined);
//   console.log(result);
// }

// main();
