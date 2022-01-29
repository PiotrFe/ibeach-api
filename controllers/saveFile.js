// import { constants } from "fs";
// import { writeFile, access, readFile, open } from "fs/promises";
// import path from "path";
// import { storageDir } from "../server.js";

const { constants } = require("fs");
const { writeFile, access, readFile, open } = require("fs/promises");
const path = require("path");
const { createStorageIfNone } = require("./createStorageIfNone.js");
const { getStoragePath } = require("../utils/getStoragePath.js");

let storageDir;

try {
  storageDir = getStoragePath();
} catch (e) {
  console.log(e);
  throw new Error(e.message);
}
module.exports.saveFile = async ({ weekTs, pdm, data, submit = false }) => {
  await createStorageIfNone({ weekTs });

  const folderPath = path.resolve(storageDir, "people", `${weekTs}`);

  if (pdm === "allocator") {
    try {
      return await saveToReadyFile({ weekTs, data, overwrite: true });
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }
  }

  const filePath = path.join(folderPath, `${pdm.toLowerCase()}.json`);

  console.log({ filePath });

  try {
    await access(filePath, constants.R_OK | constants.W_OK);
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }

  try {
    const fileContents = await readFile(filePath, "utf8");
    const dataJSON = JSON.parse(fileContents);
    const status = dataJSON.splice(dataJSON.length - 1, 1)[0];

    if (submit) {
      status.status = "done";

      await saveToReadyFile({ weekTs, data });
    }

    const updatedData = [...data, status];

    return await writeFile(filePath, JSON.stringify(updatedData), "utf8");
  } catch (e) {
    throw new Error(e.message);
  }
};

const saveToReadyFile = async ({ weekTs, data, overwrite = false }) => {
  const folderPath = path.resolve(storageDir, "people", `${weekTs}`);
  const readyFilePath = path.join(folderPath, "ready.json");
  let fileHandle;

  let fileContents;

  try {
    fileContents = await readFile(readyFilePath, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") {
      fileHandle = await open(readyFilePath, "w+");
    } else {
      throw new Error(e.message);
    }
  }

  if (overwrite) {
    try {
      return await writeFile(readyFilePath, JSON.stringify(data), "utf8");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  const submittedData = await readFile(readyFilePath, "utf8");

  const updatedData = submittedData
    ? [...JSON.parse(submittedData), ...data]
    : [...data];

  if (fileHandle) {
    fileHandle.close();
  }

  return await writeFile(
    path.join(folderPath, "ready.json"),
    JSON.stringify(updatedData),
    "utf8"
  );
};
