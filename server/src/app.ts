import express from "express";
import cors from "cors";
import routes from "./routes/index";
import "./jobs/rss.job";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

export default app;