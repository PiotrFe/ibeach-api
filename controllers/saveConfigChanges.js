const { constants } = require("fs");
const { access, readFile, open, writeFile } = require("fs/promises");
const path = require("path");
const { getStoragePath } = require("../utils/getStoragePath.js");

module.exports.saveConfigChanges = async (configChanges) => {
  if (!configChanges) {
    throw new Error("No config changes provided");
  }

  let storageDir;
  let configRaw;
  let fileHandle;

  try {
    storageDir = getStoragePath();
  } catch (e) {
    console.log(e);
    throw e;
  }

  const filePath = path.join(storageDir, "config.json");

  try {
    await access(storageDir, constants.R_OK | constants.W_OK);
  } catch (e) {
    throw e;
  }

  try {
    configRaw = await readFile(filePath, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    fileHandle = await open(filePath, "w+");
  }

  const config = configRaw ? JSON.parse(configRaw) : {};

  for (let change of configChanges) {
    const { field, value } = change;
    config[field] = value;
  }

  try {
    await writeFile(filePath, JSON.stringify(config), "utf8");
  } catch (e) {
    console.log(e);
    throw e;
  }

  if (fileHandle) {
    fileHandle.close();
  }

  return config;
};
