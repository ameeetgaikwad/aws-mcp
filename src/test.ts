import { readFileSync } from "fs";

import { Client } from "ssh2";

const conn = new Client();
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
      if (err) throw err;
      stream
        .on("close", (code: number, signal: string) => {
          console.log(
            "Stream :: close :: code: " + code + ", signal: " + signal,
          );
          conn.end();
        })
        .on("data", (data: string) => {
          console.log("STDOUT: " + data);
        })
        .end(
          [
            // "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
            // "source ~/.bashrc",
            "nvm install node",
            "node -v",
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
  .connect({
    host: "44.201.255.110",
    port: 22,
    username: "ubuntu",
    privateKey: readFileSync("../aws/mcp-test.pem"),
  });

// example output:
// Client :: ready
// STDOUT:  17:41:15 up 22 days, 18:09,  1 user,  load average: 0.00, 0.01, 0.05
//
// Stream :: exit :: code: 0, signal: undefined
// Stream :: close
