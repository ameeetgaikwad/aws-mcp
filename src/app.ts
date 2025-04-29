import express from "express";
import { errorHandler } from "./middlewares/errorHandler";


import cors from "cors";
import { router } from "./routes";
import { logger } from "./services/logger";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./constants";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(MORGAN_FORMAT, {
    stream: {
      write: (message) => {
        logger.info(message);
      },
    },
  }),
);

app.get("/", (req, res) => {
  res.status(200).send("API is running");
});

app.use("/api/v1", router);


// app.all("*", (req, res, next) => {
//   next(new Error(`Can't find ${req.originalUrl} on this server`));
// });

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
