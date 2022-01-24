// import { constants } from "fs";
// import { access, readdir, readFile } from "fs/promises";
// import path from "path";
// import { storageDir } from "../server.js";

const { constants } = require("fs");
const { access, readdir, readFile } = require("fs/promises");
const path = require("path");
const { getStoragePath } = require("../utils/getStoragePath.js");

let storageDir;

try {
  storageDir = getStoragePath();
} catch (e) {
  console.log(e);
  throw new Error(e.message);
}
module.exports.retrieveProjectData = async ({ weekTs }) => {
  const filePath = path.resolve(
    storageDir,
    "projects",
    `${weekTs}`,
    `${weekTs}.json`
  );

  try {
    await access(filePath, constants.R_OK);
  } catch (e) {
    throw new Error("No data");
  }

  try {
    const fileContents = await readFile(filePath, "utf8");
    const data = JSON.parse(fileContents);

    return data;
  } catch (e) {
    throw new Error(e.message);
  }
};
