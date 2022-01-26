// import { constants } from "fs";
// import { access, readdir, readFile } from "fs/promises";
// import path from "path";

const { constants, readdirSync } = require("fs");
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

module.exports.retrieveData = async ({
  weekTs,
  skipLookupTable = false,
  submittedOnly = false,
  getConfig = true,
}) => {
  const filePath = path.resolve(storageDir, "people", `${weekTs}`);
  let data;
  let lookupTable;
  let config;

  try {
    await access(filePath, constants.R_OK);
  } catch (e) {
    throw new Error("No data");
  }

  try {
    lookupTable = skipLookupTable
      ? null
      : await readFile(path.join(storageDir, "lookup.json"), "utf8");
  } catch (e) {}

  try {
    config = !getConfig
      ? null
      : await readFile(path.join(storageDir, "config.json"), "utf8");
  } catch (e) {}

  if (submittedOnly) {
    try {
      data = await retrieveSubmittedData({
        filePath,
      });
    } catch (e) {
      throw new Error("No data");
    }
  } else {
    try {
      data = await retrieveAllData({
        filePath,
      });
    } catch (e) {
      throw new Error("No data");
    }
  }

  return Promise.resolve({
    ...data,
    ...(lookupTable && {
      lookupTable: JSON.parse(lookupTable),
    }),
    ...(config && {
      config: JSON.parse(config),
    }),
  });
};

const retrieveSubmittedData = async ({ filePath }) => {
  try {
    const fileContents = await readFile(
      path.join(filePath, "ready.json"),
      "utf8"
    );
    return {
      data: JSON.parse(fileContents),
    };
  } catch (e) {
    throw new Error(e);
  }
};

const retrieveAllData = async ({ filePath }) => {
  try {
    const files = await readdir(filePath);

    for (let file of files) {
      if (file === "ready.json") {
        continue;
      }

      const fileContents = await readFile(path.join(filePath, file), "utf8");
      const dataJSON = JSON.parse(fileContents);

      const { status, pdm } = dataJSON.splice(dataJSON.length - 1, 1)[0] || {};

      if (status && pdm) {
        if (statusSummary[status]) {
          statusSummary[status].push(pdm);
        } else {
          statusSummary[status] = [pdm];
        }
      }

      if (!submittedOnly || (submittedOnly && status === "done")) {
        data.push(...dataJSON);
      }
    }

    return {
      data,
      statusSummary,
    };
  } catch (e) {
    throw new Error(e);
  }
};
