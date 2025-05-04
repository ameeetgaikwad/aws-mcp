import { SSHService } from "../lib/ssh";

/**
 * Example: Install a package on the remote server
 */
export const installPackage = async (packageName: string): Promise<void> => {
  const sshService = new SSHService();

  try {
    console.log(`Installing package: ${packageName}`);
    const result = await sshService.executeCommands([
      `sudo apt-get update`,
      `sudo apt-get install -y ${packageName}`,
    ]);

    if (result.code !== 0) {
      throw new Error(
        `Package installation failed with exit code ${result.code}`,
      );
    }

    console.log(`Package ${packageName} successfully installed`);
  } catch (error) {
    console.error(`Failed to install package ${packageName}:`, error);
    throw error;
  }
};

/**
 * Example: Deploy an application to the remote server
 */
export const deployApplication = async (
  sourcePath: string,
  destPath: string,
): Promise<void> => {
  // Here you would first use SCP to copy files (requires a separate implementation)
  // Then use SSH to set up the deployment

  const sshService = new SSHService();

  try {
    console.log(`Deploying application from ${sourcePath} to ${destPath}`);
    const result = await sshService.executeCommands([
      `mkdir -p ${destPath}`,
      `cd ${destPath} && npm install`,
      `cd ${destPath} && npm run build`,
      `cd ${destPath} && pm2 restart app || pm2 start app.js --name app`,
    ]);

    if (result.code !== 0) {
      throw new Error(`Deployment failed with exit code ${result.code}`);
    }

    console.log(`Application successfully deployed to ${destPath}`);
  } catch (error) {
    console.error(`Failed to deploy application:`, error);
    throw error;
  }
};

/**
 * Example: Get system information
 */
export const getSystemInfo = async (): Promise<string> => {
  const sshService = new SSHService();

  try {
    const result = await sshService.executeCommands([
      `uname -a`,
      `free -h`,
      `df -h`,
      `cat /proc/cpuinfo | grep "model name" | head -1`,
    ]);

    if (result.code !== 0) {
      throw new Error(
        `Failed to get system information with exit code ${result.code}`,
      );
    }

    return result.stdout.join("\n");
  } catch (error) {
    console.error(`Failed to get system information:`, error);
    throw error;
  }
};

/**
 * Example: Execute a custom command with a custom configuration
 */
export const executeCustomCommand = async (
  command: string,
  configOverrides: Record<string, any> = {},
): Promise<string> => {
  const sshService = new SSHService();

  try {
    const result = await sshService.executeCommand(command);

    if (result.code !== 0) {
      throw new Error(`Command execution failed with exit code ${result.code}`);
    }

    return result.stdout.join("\n");
  } catch (error) {
    console.error(`Failed to execute command:`, error);
    throw error;
  }
};
