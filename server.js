// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import bodyParser from "body-parser";
// import { fileURLToPath } from "url";
// import path from "path";
// import {
//   storeFile,
//   retrieveData,
//   saveFile,
//   retrieveProjectData,
//   saveProjectFile,
//   allocateToProject,
// } from "./controllers/index.js";

const path = require("path");

const dotEnvPath = path.join(__dirname, ".env");
require("dotenv").config({
  path: dotEnvPath,
});

const express = require("express");

const port = process.env.PORT || 4000;

const cors = require("cors");
const bodyParser = require("body-parser");

const kill = require("kill-port");
const open = require("open");

const {
  storeFile,
  retrieveData,
  saveFile,
  retrieveProjectData,
  saveProjectFile,
  allocateToProject,
} = require("./controllers/index.js");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "client-dev-app")));
app.use(bodyParser.text());
app.use(bodyParser.json());

// TODO: switch back
// const currentPath = fileURLToPath(import.meta.url);
// const currentDir = path.dirname(currentPath);
// export const storageDir = path.resolve(currentDir, "data_storage");
// const storageDir = path.resolve("/", `${process.env.STORAGE_DIR}`);

let server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.once("error", (e) => {
  if (e.code === "EADDRINUSE") {
    kill(4000, "tcp")
      .then(
        () =>
          (server = app.listen(port, () => {
            console.log(
              `Closed other process and reopened the server on port ${port}`
            );
          }))
      )
      .catch((e) => {
        console.log(e);
        res.status(500).send("Something went wrong");
      });
  }
});

app.post("/api/master/:weekTs", async (req, res) => {
  const weekTs = req.params.weekTs;

  try {
    await storeFile({ weekTs, data: req.body });
    res.status(201).send();
  } catch (e) {
    if (e === 422) {
      return res.status(400).send("Wrong file format");
    }
    res.status(400).send("Upload failed");
  }
});

app.get("/api/people/:weekTs/", async (req, res) => {
  const weekTs = req.params.weekTs;
  const submittedOnly = req.query.submitted === "true" ? true : false;
  const skipLookupTable = req.query.skiplookup === "true" ? true : false;

  try {
    const {
      data: people,
      statusSummary,
      lookupTable,
    } = await retrieveData({
      weekTs,
      submittedOnly,
      skipLookupTable,
    });
    res.json({
      people,
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

app.post("/api/people/:weekTs/:pdm", async (req, res) => {
  const { weekTs, pdm } = req.params;
  const pdmDecoded = decodeURIComponent(pdm);

  try {
    await saveFile({ weekTs, pdm: pdmDecoded, data: req.body });
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.post("/api/people/:weekTs/:pdm/submit", async (req, res) => {
  const { weekTs, pdm } = req.params;
  const pdmDecoded = decodeURIComponent(pdm);

  try {
    await saveFile({ weekTs, pdm: pdmDecoded, data: req.body, submit: true });
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.get("/api/projects/:weekTs", async (req, res) => {
  const { weekTs } = req.params;

  try {
    const data = await retrieveProjectData({
      weekTs,
    });

    res.json(data);
  } catch (e) {
    console.log(e);
    if (e.message === "No data") {
      res.status(404).send();
    } else {
      res.status(500).send();
    }
  }
});

app.post("/api/projects/:weekTs", async (req, res) => {
  const { weekTs } = req.params;

  try {
    await saveProjectFile({ weekTs, data: req.body });
    res.status(201).send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

app.patch("/api/allocate/:weekTs", async (req, res) => {
  const { weekTs } = req.params;

  try {
    const { peopleData, projectData } = await allocateToProject({
      weekTs,
      data: req.body,
    });

    res.send({ peopleData, projectData });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

const launchChrome = async function () {
  open("http://localhost:4000");
};

launchChrome();

// module.exports.storageDir = storageDir;
