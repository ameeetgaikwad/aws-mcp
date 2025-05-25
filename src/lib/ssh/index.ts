import { Client, ClientChannel } from "ssh2";
import { logger } from "../../services/logger";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export interface SSHConnectionConfig {
  host: string;
  port: number;
  username: string;
  privateKey: string;
}

export interface SSHCommandResult {
  code: number;
  stdout: string[];
  stderr: string[];
}

/**
 * Get SSH config with optional overrides
 */
export function getSSHConfig(): SSHConnectionConfig {
  const privateKey = fs.readFileSync(
    process.env.PEM_FILE_ABSOLUTE_PATH!,
    "utf8",
  );

  return {
    host: process.env.PUBLIC_IP!,
    port: 22,
    username: process.env.USERNAME!,
    privateKey: privateKey,
  };
}

export class SSHService {
  private config: SSHConnectionConfig;
  private client: Client;

  constructor() {
    this.config = getSSHConfig();
    this.client = new Client();
  }

  public async executeCommands(commands: string[]): Promise<SSHCommandResult> {
    return new Promise((resolve, reject) => {
      try {
        const stdout: string[] = [];
        const stderr: string[] = [];

        // Add timeout to prevent hanging connections
        const timeout = setTimeout(() => {
          logger.warn("SSH connection timed out - forcing disconnect");
          this.client.end();
          resolve({
            code: 0,
            stdout,
            stderr: [...stderr, "Connection timed out"],
          });
        }, 30000); // 30 second timeout

        this.client
          .on("ready", () => {
            logger.info("SSH connection established");

            this.client.shell((err, stream) => {
              if (err) {
                clearTimeout(timeout);
                reject(err);
                return;
              }

              stream
                .on("close", (code: number, signal: string) => {
                  logger.info(
                    `Shell session closed with code ${code}, signal: ${signal}`,
                  );
                  clearTimeout(timeout);
                  this.client.end();

                  resolve({
                    code,
                    stdout,
                    stderr,
                  });
                })
                .on("data", (data: Buffer) => {
                  const output = data.toString();
                  logger.info(`STDOUT: ${output}`);
                  stdout.push(output);
                })
                .on("stderr", (data: Buffer) => {
                  const output = data.toString();
                  logger.error(`STDERR: ${output}`);
                  stderr.push(output);
                })
                .on("error", (err: Error) => {
                  logger.error("Shell stream error:", err);
                  stderr.push(err.message);
                  clearTimeout(timeout);
                  reject(err);
                });

              // Send all commands followed by exit
              const commandString = [...commands, "exit", ""].join("\r\n");
              stream.end(commandString);
            });
          })
          .on("error", (err) => {
            logger.error("SSH connection error:", err);
            clearTimeout(timeout);
            reject(err);
          })
          .connect(this.config);
      } catch (error) {
        logger.error("SSH setup error:", error);
        reject(error);
      }
    });
  }

  public async executeCommand(command: string): Promise<SSHCommandResult> {
    return this.executeCommands([command]);
  }

  public async getShell(): Promise<ClientChannel> {
    return new Promise((resolve, reject) => {
      try {
        this.client
          .on("ready", () => {
            console.log("SSH connection established for interactive shell");

            this.client.shell((err, stream) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(stream);
            });
          })
          .on("error", (err) => {
            console.error("SSH connection error:", err);
            reject(err);
          })
          .connect(this.config);
      } catch (error) {
        console.error("SSH setup error:", error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end();
    }
  }
}
