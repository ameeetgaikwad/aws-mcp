import { getSSHConfig, SSHService } from "../../lib/ssh";

import { NGINX_CONFIG } from "../../constants";

import { ToolHandler } from "../../types/types";

export const installNode: ToolHandler = async (args, extra) => {
  const sshService = new SSHService();

  try {
    const result = await sshService.executeCommands([
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
      "source ~/.bashrc",
      "nvm install node",
    ]);

    if (result.code !== 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error: `Node installation failed with exit code ${result.code}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
    console.log("Node.js successfully installed");
    return {
      content: [{ type: "text", text: "Node.js successfully installed" }],
    };
  } catch (error) {
    console.error("Failed to install Node.js:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              error: "Node.js installation failed" + error,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
};
