import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
// import winston from 'winston';
// import expressWinston from 'express-winston';
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// app.all("*", (req, res, next) => {
//   next(new Error(`Can't find ${req.originalUrl} on this server`));
// });

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
