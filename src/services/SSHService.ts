import { Client, ClientChannel } from "ssh2";
import { logger } from "./logger";

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

export class SSHService {
  private config: SSHConnectionConfig;
  private client: Client;

  constructor(config: SSHConnectionConfig) {
    this.config = config;
    this.client = new Client();
  }

  public async executeCommands(commands: string[]): Promise<SSHCommandResult> {
    return new Promise((resolve, reject) => {
      try {
        const stdout: string[] = [];
        const stderr: string[] = [];

        this.client
          .on("ready", () => {
            logger.info("SSH connection established");

            this.client.shell((err, stream) => {
              if (err) {
                reject(err);
                return;
              }

              stream
                .on("close", (code: number, signal: string) => {
                  logger.info(
                    `Shell session closed with code ${code}, signal: ${signal}`,
                  );
                  this.client.end();

                  resolve({
                    code,
                    stdout,
                    stderr,
                  });
                })
                .on("data", (data: Buffer) => {
                  const output = data.toString();
                  console.log(`STDOUT: ${output}`);
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
                  reject(err);
                });

              // Send all commands followed by exit
              const commandString = [...commands, "exit", ""].join("\r\n");
              stream.end(commandString);
            });
          })
          .on("error", (err) => {
            logger.error("SSH connection error:", err);
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
