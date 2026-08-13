import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { courseDataRouter } from "./routes/course-data";

export const app = express();

app.use(cors());
app.use(express.json());

app.use(courseDataRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: "Internal Server Error" });
});
