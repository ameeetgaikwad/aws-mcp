# AWS MCP Server

This is a Model Context Protocol (MCP) server that provides tools to create and manage AWS EC2 instances. You can use this server to perform various operations such as installing software (Node.js, PM2, Nginx), configuring services, managing security groups, S3 buckets, and more.

## Available Tools

Below is a list of tools available through this MCP server:

*   **install-node**: Installs Node.js on an EC2 instance.
*   **install-pm2**: Installs PM2 on an EC2 instance.
*   **install-nginx**: Installs Nginx on an EC2 instance.
*   **setup-nginx**: Sets up Nginx on an EC2 instance.
    *   `domain` (optional): Domain name for HTTPS and SSL certificate configuration. Leave empty if HTTPS is not needed.
    *   `port`: The port on which your server is running.
*   **setup-github-ssh-keys**: Sets up GitHub SSH keys on an EC2 instance. This will generate a new SSH key pair and add it to the EC2 instance. The public key will also be returned to the user for adding to GitHub.
    *   `email` (optional): The email address to use for the GitHub SSH keys.
*   **clone-github-repository**: Clones a GitHub repository on an EC2 instance.
    *   `githubUrl`: The URL of the GitHub repository to clone.
*   **get-security-groups**: Gets the security groups for the EC2 instance.
*   **create-ec2-instance**: Creates an EC2 instance in AWS.
    *   `instanceName`: The name of the EC2 instance.
    *   `region`: AWS region to create the EC2 instance in.
    *   `instanceType`: The type of EC2 instance to create.
    *   `amiId`: The AMI ID to use for the EC2 instance. By default, it will use the latest Ubuntu 24.04 LTS AMI.
    *   `keyName`: The key name to use for the EC2 instance.
    *   `securityGroupIds`: The security group IDs to use for the EC2 instance.
    *   `subnetId`: The subnet ID to use for the EC2 instance.
    *   `volumeSize`: The size of the volume to use for the EC2 instance.
    *   `volumeType`: The type of volume to use for the EC2 instance.
*   **show-aws-account**: Shows the AWS account for the user.
*   **stop-ec2-instance**: Stops an EC2 instance in AWS.
    *   `instanceId`: The ID of the EC2 instance to stop.
*   **delete-ec2-instance**: Deletes an EC2 instance in AWS.
    *   `instanceId`: The ID of the EC2 instance to delete.
*   **list-all-ec2-instances**: Lists all EC2 instances in AWS.
*   **get-key-pairs**: Retrieves all EC2 key pairs from AWS.
*   **create-key-pair**: Creates a new EC2 key pair in AWS.
    *   `keyName`: Name for the new key pair.
*   **create-security-group**: Creates a security group in AWS.
    *   `name`: Name of the security group.
    *   `description`: Description for the security group.
    *   `inboundRules`: List of inbound rules (protocol, fromPort, toPort, cidrIp).
*   **edit-security-group**: Edits a security group in AWS.
    *   `groupId`: The ID of the security group to edit.
    *   `inboundRules`: List of inbound rules (protocol, fromPort, toPort, cidrIp).
*   **create-vpc**: Creates a VPC in AWS with necessary networking components.
    *   `cidrBlock`: The CIDR block for the VPC (e.g., '10.0.0.0/16').
    *   `name`: Name tag for the VPC.
*   **get-subnet-id**: Retrieves a subnet ID associated with the provided VPC ID.
    *   `vpcId`: The VPC ID to find the subnet ID for.
*   **list-s3-buckets**: Lists all S3 buckets in the AWS account.
*   **create-s3-bucket**: Creates a new S3 bucket.
    *   `bucketName`: The name of the S3 bucket to create.
    *   `region` (optional): The AWS region to create the bucket in.
*   **delete-s3-bucket**: Deletes an S3 bucket.
    *   `bucketName`: The name of the S3 bucket to delete.
*   **list-s3-objects**: Lists all objects in an S3 bucket.
    *   `bucketName`: The name of the S3 bucket.
*   **upload-file-to-s3**: Uploads a file to an S3 bucket.
    *   `bucketName`: The name of the S3 bucket.
    *   `key`: The key (path) where the file will be stored in S3.
    *   `filePath`: The local path of the file to upload.
    *   `contentType` (optional): The content type of the file.
*   **download-file-from-s3**: Downloads a file from an S3 bucket.
    *   `bucketName`: The name of the S3 bucket.
    *   `key`: The key (path) of the file in S3.
    *   `filePath`: The local path where the file will be downloaded.
*   **delete-file-from-s3**: Deletes a file from an S3 bucket.
    *   `bucketName`: The name of the S3 bucket.
    *   `key`: The key (path) of the file to delete in S3.

## How to Run

To use this AWS MCP server with Cursor, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    # Using npm
    npm install
    # Or using yarn
    # yarn install
    ```

3.  **Build the project:**
    ```bash
    # Using npm
    npm run build
    # Or using yarn
    # yarn build
    ```
    (This will typically create a `dist/index.js` file, which is the entry point for the server.)

4.  **Configure Cursor's `mcp.json`:**
    *   Open your Cursor configuration file, usually located at `~/.cursor/mcp.json` (create it if it doesn't exist).
    *   Add or update the configuration for this server. It should look similar to this:

    ```json
    {
      "mcpServers": {
        "aws-mcp": { // You can choose any name for your server
          "command": "/path/to/your/node/executable", // e.g., /Users/yourname/.nvm/versions/node/v20.10.0/bin/node
          "args": ["/path/to/your/aws-mcp/dist/index.js"], // Path to the built index.js
          "env": {
            "AWS_ACCESS_KEY_ID": "YOUR_AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY": "YOUR_AWS_SECRET_ACCESS_KEY",
            "AWS_REGION": "your-aws-region", // e.g., us-east-1
            "PEM_FILE_ABSOLUTE_PATH": "/path/to/your/ec2_instance.pem", // Absolute path to your .pem file
            "USERNAME": "your-ec2-instance-username", // e.g., ubuntu, ec2-user
            "PUBLIC_IP": "your-ec2-instance-public-ip" // Public IP of the EC2 instance to connect to for setup tools
          }
        }
      }
    }
    ```

    **Important:**
    *   Replace placeholder values (like `/path/to/your/...`, `YOUR_AWS_ACCESS_KEY_ID`, etc.) with your actual paths and credentials.
    *   The `command` should be the absolute path to your Node.js executable.
    *   The `args` should contain the absolute path to the `dist/index.js` file generated in the build step.
    *   The environment variables `PEM_FILE_ABSOLUTE_PATH`, `USERNAME`, and `PUBLIC_IP` are required for tools that interact directly with an EC2 instance (e.g., `install-node`, `setup-nginx`).

5.  **Restart Cursor:** After saving the `mcp.json` file, restart Cursor to load the MCP server.

Now you should be able to use the AWS MCP tools within Cursor! 