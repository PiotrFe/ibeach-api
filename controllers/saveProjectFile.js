// import { constants } from "fs";
// import { writeFile, access, readFile, open, mkdir } from "fs/promises";
// import path from "path";
// import { storageDir } from "../server.js";

const { constants } = require("fs");
const { writeFile, access, readFile, open, mkdir } = require("fs/promises");
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


module.exports.saveProjectFile = async ({ weekTs, data }) => {
  await createStorageIfNone({ weekTs });

  const folderPath = path.join(storageDir, "projects", `${weekTs}`);
  const filePath = path.join(folderPath, `${weekTs}.json`);

  let fileContents;

  try {
    fileContents = await readFile(filePath, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw new Error(e.message);
    }
  }

  try {
    // TODO: add create and update ts and resolve conflicts (i.e. only overwrite entries with < ts)
    const updatedData = [...data];

    return await writeFile(filePath, JSON.stringify(updatedData), "utf8");
  } catch (e) {
    throw new Error(e.message);
  }
};
