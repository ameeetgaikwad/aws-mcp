import { SSHService } from "../../lib/ssh";
import { utils } from "ssh2";

import { ToolHandler } from "../../types/types";
import { logger } from "../../services/logger";
import { tryCatch } from "../../common/try-catch";

import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol";

import {
  ServerRequest,
  ServerNotification,
} from "@modelcontextprotocol/sdk/types";

type SetupGithubSSHKeysArgs = {
  email?: string;
};
type InstallGithubSSHKeysArgs = {
  githubUrl: string;
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

/**
 * Check if a GitHub repository is public by making a GET request
 */
const isPublicRepo = (owner: string, repo: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const url = `https://github.com/${owner}/${repo}`;

    fetch(url, {
      method: "GET",
    })
      .then((response) => {
        resolve(response.status === 200);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const installGithub: InstallGithubToolHandler = async (args, extra) => {
  const sshService = new SSHService();

  const sshUrlRegex =
    /^git@github\.com:([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?$/;
  const httpsUrlRegex =
    /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?$/;

  let cloneCommand = "";

  let owner = "";
  let repo = "";

  if (sshUrlRegex.test(args.githubUrl)) {
    // Extract owner and repo from SSH URL
    const match = args.githubUrl.match(sshUrlRegex);
    if (match) {
      owner = match[1];
      repo = match[2];
      if (repo.endsWith(".git")) {
        repo = repo.slice(0, -4);
      }
    }

    cloneCommand = `git clone ${args.githubUrl}`;

    const execResult = await tryCatch(
      sshService.executeCommands([`${cloneCommand} && exit`]),
    );

    if (execResult.error) {
      logger.error(`SSH git clone error:`, execResult.error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error: `Failed to clone repository using SSH: ${execResult.error}. Make sure you have github ssh keys setup in the ec2 instance.`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const result = execResult.data;
    if (result.code !== 0) {
      logger.error(`Git clone failed with exit code ${result.code}`);
      logger.error(`STDERR: ${result.stderr.join("\n")}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error: `Git clone failed with exit code ${result.code}: ${result.stderr.join("\n")}. Make sure you have github ssh keys setup in the ec2 instance.`,
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
              message: `Successfully cloned ${owner}/${repo} repository`,
              repoType: "SSH",
            },
            null,
            2,
          ),
        },
      ],
    };
  } else if (httpsUrlRegex.test(args.githubUrl)) {
    // Extract owner and repo from HTTPS URL
    const match = args.githubUrl.match(httpsUrlRegex);
    if (match) {
      owner = match[1];
      repo = match[2];
      if (repo.endsWith(".git")) {
        repo = repo.slice(0, -4);
      }

      // Check if repo is public
      const isPublic = await isPublicRepo(owner, repo);

      if (isPublic) {
        cloneCommand = `git clone ${args.githubUrl}`;

        const execResult = await tryCatch(
          sshService.executeCommands([`${cloneCommand} && exit`]),
        );

        if (execResult.error) {
          logger.error(`HTTPS git clone error:`, execResult.error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    error: `Failed to clone repository: ${execResult.error}.`,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        const result = execResult.data;
        if (result.code !== 0) {
          logger.error(`Git clone failed with exit code ${result.code}`);
          logger.error(`STDERR: ${result.stderr.join("\n")}`);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    error: `Git clone failed with exit code ${result.code}: ${result.stderr.join("\n")}. Make sure you have github ssh keys setup in the ec2 instance.`,
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
                  message: `Successfully cloned ${owner}/${repo} repository`,
                  repoType: "HTTPS",
                },
                null,
                2,
              ),
            },
          ],
        };
      } else {
        const sshUrl = `git@github.com:${owner}/${repo}${repo.endsWith(".git") ? "" : ".git"}`;

        cloneCommand = `git clone ${sshUrl} && exit`;

        const execResult = await tryCatch(
          sshService.executeCommands([`${cloneCommand} && exit`]),
        );

        if (execResult.error) {
          logger.error(`SSH git clone error:`, execResult.error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    error: `Failed to clone repository using SSH: ${execResult.error}. Make sure you have github ssh keys setup in the ec2 instance using setup-github-ssh-keys tool`,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        const result = execResult.data;
        if (result.code !== 0) {
          logger.error(`Git clone failed with exit code ${result.code}`);
          logger.error(`STDERR: ${result.stderr.join("\n")}`);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    error: `Git clone failed with exit code ${result.code}: ${result.stderr.join("\n")}. Make sure you have github ssh keys setup in the ec2 instance.`,
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
                  message: `Successfully cloned private repository ${owner}/${repo} using SSH`,
                  originalRepoType: "HTTPS",
                  clonedWith: "SSH",
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    }

    // Return error if match is falsy
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              error:
                "Could not parse repository information from the provided URL.",
            },
            null,
            2,
          ),
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "error",
              error:
                "Invalid GitHub URL format. URL must be in SSH format (git@github.com:username/repo.git) or HTTPS format (https://github.com/username/repo.git)",
            },
            null,
            2,
          ),
        },
      ],
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

    const execResult = await tryCatch(
      sshService.executeCommands([
        `echo '${privateKey}' | sudo tee ~/.ssh/id_ed25519 > /dev/null`,
        `chmod 600 ~/.ssh/id_ed25519`,
        `echo '${publicKey}' | sudo tee ~/.ssh/id_ed25519.pub > /dev/null`,
        "exit",
      ]),
    );

    if (execResult.error) {
      logger.error(`SSH key setup error:`, execResult.error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "error",
                error: `GitHub SSH keys setup failed: ${execResult.error}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const result = execResult.data;

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
