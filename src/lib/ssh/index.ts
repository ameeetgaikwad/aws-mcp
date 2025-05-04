import { Client, ClientChannel } from "ssh2";
import { logger } from "../../services/logger";
import dotenv from "dotenv";

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
  return {
    host: "44.201.255.110",
    port: 22,
    username: "ubuntu",
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvhYp9oirFFszMEzso93S6o90hH04DoL409F5W5sfRowolKtu
Tz+hyRlVGbfzeK2SBdlkmRuEOVftMWCiKeljGcFTyNCy83ZUJLx25yTIgMxKPn46
RdVP0BaO4cdeFCk3ftxilPmHVhiazsW+Ls/+I+B7vUcKUXjIb2tp1Sl2AIzMulqY
LkPmiJPGxtb2eElcR7SGV0/Ly69bNr3UDL1PAmYPrwnKG8b4396NK4+QpvdWKaZa
e7megIJFfBHz5lABTmwYikMkMKnV4pELv8JxjBzubBrR66ffZV8mhRSrE3oVpea3
vIsnaMtueU2QNUfBb4RJmNn2gFHtQ6V+RCayJwIDAQABAoIBAA2NBvDMTWXmGoAW
+8eyyJZwI55OTvC55YM0K7KcHF6rHzl5/yMnJiFv7OEoe/LebMp99O31SDfOTNp4
SRczzBzJ628lcZxpkxYLWW6g8Ko95g0OcpkH2+i5svXlgI9vYMVqcJyuLTe2CVM0
RZqQuU1Vc3zK07F7Ks7GmYTYr9DaGRwwpqsg2dM6Eah0ZPcbr4Vfgm2z9M2KzmOm
bTtsBLWQujTNYp2iJaEvkWORAzdf5cSkTuOIt77r4AhzSD+mkKjP4aYSbL2QGMg+
KOjOcJg72exD9v2Z3lLc5URtePnMSGiDqRe2V8MG70kg1MkNtRnR26a/aKy85rkO
JKYS9gECgYEA9Yxaja9n18yHDES84dihwg5ctEkGWssqKR9I/KCtbqUF4UUTuCOz
7sX22Ko8D56lQ1BQdCH6IUQXKtviaFehKd9DUO7duENyj+o0Jj4Xorey6STKH+qO
Xs1wyhDipNXYqbZhqJKfXOT6DVNkNnd3KBYzt2W304VNwbXMX+EvJ40CgYEAxi13
HgO1NfaTeX5DbWsEK7NCWhlVk/0I7Op67h2HGiQXbTv0yXmRG3Pr8pR7dg1pBlOF
7O8/v3KTfXULj8e7+aj+H9QoxjqKNpvtfaw5MmjF9Q2RZMSPNH+lJgZ0y/q2V4Il
aNeKgTv/t/Bs+MLwQwTE38FucTgUo1ZZPpgHiYMCgYBw+nUnv88dwaNZh78Igy5a
JVWONhNQby4k4ZopcpyZziAYeDoMfZDqifd71UfxP+N2R1vdM0ztRXELbUSNEdS7
eVh1wpINmCr8AJyiA+vIGJGfKCg/6yI6iHge4QoHIcWgwKPKdjwQ9+H9g6MWVH1k
2mJNPeYI0srmGAnDC88weQKBgQCRDC/V8QLNp1aTIr35NM2NqptS1J4VPasttAUb
iNMcZ/QZiDuGxwpU3IiCOPkQE4qeDb3FB+tRlWur9GHs71R+y5iL9T2OsMP+aivt
woLuiU7yJ+cVqOPjmdVnOmx761lQPTpiPPfr1N06ZKdtf0hY1QG/f5T1GwXH8uhI
7v79PwKBgDYVGfayxfAzMORuQp2BCcDPr9J73R8meF0Y30+4rVOpPM+B5dKvnTh1
2+vebODYJH9lpg33dRe82iuoWNp+gHUGAZ91d+WnqEIIUezAVh5g+p+I6/i+BR3/
lv5q4T2ewsnvHwZSxsTocqYRVUL9mC6YBePfZFLyt64EGF9isowL
-----END RSA PRIVATE KEY-----`!,
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
