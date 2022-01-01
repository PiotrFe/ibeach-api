import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import { storeFile, retrieveData, saveFile } from "./controllers/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());
const port = process.env.PORT || 4000;

const currentPath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentPath);
export const storageDir = path.resolve(currentDir, "data_storage");

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/api/master/:weekTs", async (req, res) => {
  const weekTs = req.params.weekTs;

  try {
    await storeFile({ weekTs, data: req.body });
    res.status(201).send("Uploaded successfully");
  } catch (e) {
    console.log(e);
    res.status(400).send("Upload failed");
  }
});

app.get("/api/week/:weekTs/", async (req, res) => {
  const weekTs = req.params.weekTs;
  const submittedOnly = Boolean(req.query.submitted);

  try {
    const { data, statusSummary, lookupTable } = await retrieveData({
      weekTs,
      submittedOnly,
    });
    res.json({
      data,
      statusSummary,
      lookupTable,
    });
  } catch (e) {
    console.log(e);
    if (e.message === "No data") {
      res.status(404).send();
    } else {
      res.status(500).send();
    }
  }
});

app.get("/api/week/:weekTs/:pdm", async (req, res) => {
  const { weekTs, pdm } = req.params;
  const pdmDecoded = decodeURIComponent(pdm);

  try {
    const { data, statusSummary } = await retrieveData({
      weekTs,
      pdm: pdmDecoded,
    });
    res.json({
      data,
      statusSummary,
    });
  } catch (e) {
    console.log(e);
    if (e.message === "No data") {
      res.status(404).send();
    } else {
      res.status(500).send();
    }
  }
});

app.post("/api/week/:weekTs/:pdm", async (req, res) => {
  const { weekTs, pdm } = req.params;
  const pdmDecoded = decodeURIComponent(pdm);

  try {
    await saveFile({ weekTs, pdm: pdmDecoded, data: req.body });
    res.status(201).send("Saved successfully");
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.post("/api/week/:weekTs/:pdm/submit", async (req, res) => {
  const { weekTs, pdm } = req.params;
  const pdmDecoded = decodeURIComponent(pdm);

  try {
    await saveFile({ weekTs, pdm: pdmDecoded, data: req.body, submit: true });
    res.status(201).send("Saved successfully");
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});
