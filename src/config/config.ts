import dotenv from "dotenv";

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
  }

export const AppConfig: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};
