import { SSHService } from "../../lib/ssh";
import { utils } from "ssh2";

import { ToolHandler } from "../../types/types";
import { logger } from "../../services/logger";

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";

import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";

type SetupGithubSSHKeysArgs = {
  email?: string;
};
type InstallGithubSSHKeysArgs = {
  githubSSHUrl: string;
};

type SetupGithubToolHandler = (
  args: SetupGithubSSHKeysArgs,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

type InstallGithubToolHandler = (
  args: InstallGithubSSHKeysArgs,
  extra?: RequestHandlerExtra<ServerRequest, ServerNotification>,
) => Promise<{
  content: { type: "text"; text: string }[];
}>;

export const installGithub: InstallGithubToolHandler = async (args, extra) => {
  const sshService = new SSHService();
  // Validate that the GitHub URL is in SSH format (git@github.com:username/repo.git)
  const sshUrlRegex = /^git@github\.com:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/;
  if (!sshUrlRegex.test(args.githubSSHUrl)) {
    logger.error("Invalid GitHub SSH URL format");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              error:
                "Invalid GitHub SSH URL format. GitHub SSH URL must be in the format: git@github.com:username/repo.git",
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  try {
    const result = await sshService.executeCommands([
      `git clone ${args.githubSSHUrl} && exit`,
    ]);

    if (result.code !== 0) {
      throw new Error(
        `nginx installation failed with exit code ${result.code}`,
      );
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
export const setupGithubSSHKeys: SetupGithubToolHandler = async (
  args,
  extra,
) => {
  const sshService = new SSHService();

  const generateKeyPairAsync = () => {
    return new Promise<{ privateKey: string; publicKey: string }>(
      (resolve, reject) => {
        utils.generateKeyPair(
          "ed25519",
          { passphrase: "", comment: args.email || "" },
          (err, keys) => {
            if (err) reject(err);
            resolve({
              privateKey: keys.private,
              publicKey: keys.public,
            });
          },
        );
      },
    );
  };

  try {
    const { privateKey, publicKey } = await generateKeyPairAsync();

    const result = await sshService.executeCommands([
      `echo '${privateKey}' | sudo tee ~/.ssh/id_ed25519 > /dev/null`,
      `chmod 600 ~/.ssh/id_ed25519`,
      `echo '${publicKey}' | sudo tee ~/.ssh/id_ed25519.pub > /dev/null`,
      "exit",
    ]);

    if (result.code !== 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error:
                  "GitHub SSH keys setup failed with exit code " + result.code,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              message:
                "SSH keys successfully set up in ec2 instance. Here is the public key, add it in you github account",
              publicKey: publicKey,
            },
            null,
            2,
          ),
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to setup GitHub SSH keys:", error);
    return {
      content: [
        { type: "text", text: "GitHub SSH keys setup failed: " + error },
      ],
    };
  }
};

async function main() {
  await setupGithubSSHKeys({}, undefined);
}

main();
