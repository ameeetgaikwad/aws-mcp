import { SSHService } from "../services/SSHService";
import { getSSHConfig } from "../config/ssh.config";
import { NGINX_CONFIG } from "../constants";
import { Result } from "../common/try-catch";

export const installNode = async (): Promise<Result<string>> => {
  const sshService = new SSHService(getSSHConfig());

  try {
    const result = await sshService.executeCommands([
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
      "source ~/.bashrc",
      "nvm install node",
    ]);

    if (result.code !== 0) {
      throw new Error(`Node installation failed with exit code ${result.code}`);
    }

    console.log("Node.js successfully installed");
    return {
      data: "",
      error: null,
    };
  } catch (error) {
    console.error("Failed to install Node.js:", error);
    return {
      data: null,
      error: error as Error,
    };
  }
};

export const installPm2 = async (): Promise<void> => {
  const sshService = new SSHService(getSSHConfig());

  try {
    const result = await sshService.executeCommands(["npm install -g pm2"]);

    if (result.code !== 0) {
      throw new Error(`pm2 installation failed with exit code ${result.code}`);
    }

    // console.log("pm2 successfully installed");
    return;
  } catch (error) {
    console.error("Failed to install pm2:", error);
    throw error;
  }
};

export const installNginx = async (): Promise<void> => {
  const sshService = new SSHService(getSSHConfig());

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
    return;
  } catch (error) {
    console.error("Failed to install nginx:", error);
    throw error;
  }
};
export const setUpNginx = async (
  domain: string,
  port: string,
): Promise<Result<string>> => {
  const sshService = new SSHService(getSSHConfig());

  try {
    const sanitized = NGINX_CONFIG.replace(/'/g, `'\\''`)
      .replace("{{domain}}", domain)
      .replace("{{port}}", port.toString());

    const result = await sshService.executeCommands([
      `sudo rm /etc/nginx/nginx.conf && echo '${sanitized}' | sudo tee /etc/nginx/nginx.conf > /dev/null && sudo nginx -s reload && exit`,
    ]);

    if (result.code !== 0) {
      return {
        data: null,
        error: new Error(
          `nginx installation failed with exit code ${result.code}`,
        ),
      };
    }

    // console.log("pm2 successfully installed");
    return {
      data: "",
      error: null,
    };
  } catch (error) {
    console.error("Failed to install nginx:", error);
    return {
      data: null,
      error: error as Error,
    };
  }
};
