import { SSHService } from "../services/SSHService";
import { getSSHConfig } from "../config/ssh.config";

export const installNode = async (): Promise<void> => {
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
    return;
  } catch (error) {
    console.error("Failed to install Node.js:", error);
    throw error;
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
      // "sudo apt update",
      "sudo apt install nginx",
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
export const setUpNginx = async (): Promise<void> => {
  const sshService = new SSHService(getSSHConfig());

  try {
    const result = await sshService.executeCommands([
      "sudo rm sudo vi /etc/nginx/nginx.conf",
      "sudo vi /etc/nginx/nginx.conf",
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

installNode();
