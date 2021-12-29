import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { storeFile } from "./controllers/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello everyone");
});

app.get("/api/master/:weekTs", (req, res) => {});

app.post("/api/master/:weekTs", async (req, res) => {
  const weekTs = req.params.weekTs;

  try {
    await storeFile({ weekTs, data: req.body });
    res.status(201).send("Uploaded successfully");
  } catch (e) {
    res.status(422).send("Upload failed");
  }
});
