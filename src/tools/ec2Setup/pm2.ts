import { getSSHConfig, SSHService } from "../../lib/ssh";

import { NGINX_CONFIG } from "../../constants";

import { ToolHandler } from "../../types/types";
import { logger } from "../../services/logger";

export const installPm2: ToolHandler = async (args, extra) => {
  const sshService = new SSHService();

  try {
    const result = await sshService.executeCommands(["npm install -g pm2"]);

    if (result.code !== 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error: `pm2 installation failed with exit code ${result.code}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // console.log("pm2 successfully installed");
    return {
      content: [{ type: "text", text: "pm2 successfully installed" }],
    };
  } catch (error) {
    logger.error("Failed to install pm2:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              error: "pm2 installation failed " + error,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
};
