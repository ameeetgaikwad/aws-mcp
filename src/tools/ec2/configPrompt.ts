import inquirer from "inquirer";

export interface EC2UserConfig {
  instanceName: string;
  instanceType: string;
  amiId: string;
  keyName: string;
  securityGroupIds?: string[];
  subnetId: string;
  volumeSize?: number;
  volumeType?: string;
  tags?: { [key: string]: string };
}

export async function promptForEC2Config(): Promise<EC2UserConfig> {
  const instanceTypes = [
    "t2.micro",
    "t2.small",
    "t2.medium",
    "t3.micro",
    "t3.small",
    "t3.medium",
  ];

  const volumeTypes = ["gp2", "gp3", "io1", "io2", "standard"];

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "instanceName",
      message: "Enter the instance name:",
    },
    {
      type: "list",
      name: "instanceType",
      message: "Select the EC2 instance type:",
      choices: instanceTypes,
    },
    {
      type: "input",
      name: "amiId",
      message: "Enter the AMI ID (e.g., ami-12345678):",
      validate: (input: string) => {
        return input.startsWith("ami-")
          ? true
          : 'AMI ID must start with "ami-"';
      },
    },
    {
      type: "input",
      name: "keyName",
      message: "Enter the key pair name (optional, press enter to skip):",
    },
    {
      type: "input",
      name: "securityGroupIds",
      message: "Enter security group IDs (comma-separated, optional):",
      filter: (input: string) =>
        input ? input.split(",").map((id) => id.trim()) : [],
    },
    {
      type: "input",
      name: "subnetId",
      message: "Enter subnet ID (optional):",
    },
    {
      type: "number",
      name: "volumeSize",
      message: "Enter volume size in GB (default: 8):",
      default: 8,
    },
    {
      type: "list",
      name: "volumeType",
      message: "Select volume type:",
      choices: volumeTypes,
      default: "gp2",
    },
    {
      type: "confirm",
      name: "addTags",
      message: "Would you like to add tags?",
      default: false,
    },
  ]);

  // Handle tags if user wants to add them
  let tags: { [key: string]: string } | undefined;
  if (answers.addTags) {
    const { tagCount } = await inquirer.prompt({
      type: "input",
      name: "tagCount",
      message: "How many tags would you like to add?",
      filter: Number,
    });

    tags = {};

    for (let i = 0; i < tagCount; i++) {
      const tagPrompt = await inquirer.prompt([
        {
          type: "input",
          name: "key",
          message: `Enter tag ${i + 1} key:`,
        },
        {
          type: "input",
          name: "value",
          message: `Enter tag ${i + 1} value:`,
        },
      ]);
      tags[tagPrompt.key] = tagPrompt.value;
    }
  }

  // Clean up undefined values and create final config
  const config: EC2UserConfig = {
    instanceType: answers.instanceType as string,
    amiId: answers.amiId as string,
    ...(answers.keyName && { keyName: answers.keyName as string }),
    ...(answers.securityGroupIds?.length && {
      securityGroupIds: answers.securityGroupIds as string[],
    }),
    ...(answers.subnetId && { subnetId: answers.subnetId as string }),
    ...(answers.volumeSize && { volumeSize: answers.volumeSize as number }),
    ...(answers.volumeType && { volumeType: answers.volumeType as string }),
    ...(tags && { tags }),
  };

  return config;
}
