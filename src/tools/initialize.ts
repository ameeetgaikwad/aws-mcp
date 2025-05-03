import { readFileSync } from "fs";

import { Client } from "ssh2";

export const InstallNode = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    try {
      conn
        .on("ready", () => {
          console.log("Client :: ready");

          // Execute all commands in a single shell session
          // const shellCommands = [
          //   'export NVM_DIR="$HOME/.nvm"',
          //   '[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"', // This loads nvm
          //   "nvm install node",
          // ].join(" && ");

          // console.log("Executing:", shellCommands);

          conn.shell((err, stream) => {
            if (err) {
              reject(err);
              return;
            }

            console.log("Shell session started");
            stream
              .on("close", (code: number, signal: string) => {
                console.log(
                  "Stream :: close :: code: " + code + ", signal: " + signal,
                );
                console.log("Shell session closed");
                conn.end();
                if (code === 0) {
                  resolve();
                } else {
                  reject(new Error(`Shell exited with code ${code}`));
                }
              })
              .on("data", (data: string) => {
                console.log("STDOUT: " + data);
              })
              .on("error", (err: Error) => {
                console.error("Shell stream error:", err);
                reject(err);
              })
              .end(
                [
                  "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
                  "source ~/.bashrc",
                  "nvm install node",
                  "node -v",
                  "exit",
                  "",
                ].join("\r\n"),
              );
          });

          // conn.exec("nvm lsfix", (err, stream) => {
          //   if (err) throw err;
          //   stream
          //     .on("close", (code, signal) => {
          //       console.log(
          //         "Stream :: close :: code: " + code + ", signal: " + signal,
          //       );
          //       conn.end();
          //     })
          //     .on("data", (data) => {
          //       console.log("STDOUT: " + data);
          //     })
          //     .stderr.on("data", (data) => {
          //       console.log("STDERR: " + data);
          //     });
          // });

          // conn.shell((err, stream) => {
          //   if (err) throw err;
          //   stream.on('close', () => {
          //     console.log('Stream :: close');
          //     conn.end();
          //   }).on('data', (data) => {
          //     console.log('OUTPUT: ' + data);
          //   });
          //   stream.end('ls -l\nexit\n');
          // });
        })
        .on("error", (err) => {
          console.error("Connection error:", err);
          reject(err);
        })
        .connect({
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
-----END RSA PRIVATE KEY-----`,
        });
    } catch (error) {
      console.error("Setup error:", error);
      reject(error);
    }
  });
};
