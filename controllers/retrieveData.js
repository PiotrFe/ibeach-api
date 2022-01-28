// import { constants } from "fs";
// import { access, readdir, readFile } from "fs/promises";
// import path from "path";

const { constants } = require("fs");
const { access, readdir, readFile } = require("fs/promises");
const path = require("path");
const { getStoragePath } = require("../utils/getStoragePath.js");

let storageDir;

try {
  storageDir = getStoragePath();
} catch (e) {
  console.log(e);
  throw e;
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
    handleError(e);
  }

  try {
    lookupTable = skipLookupTable
      ? null
      : await readFile(path.join(storageDir, "lookup.json"), "utf8");
  } catch (e) {
    handleError(e);
  }

  try {
    config = !getConfig
      ? null
      : await readFile(path.join(storageDir, "config.json"), "utf8");
  } catch (e) {
    handleError(e);
  }

  if (submittedOnly) {
    try {
      data = await retrieveSubmittedData({
        filePath,
      });
    } catch (e) {
      handleError(e);
    }
  } else {
    try {
      data = await retrieveAllData({
        filePath,
      });
    } catch (e) {
      handleError(e);
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

const handleError = (e) => {
  if (e.code !== "ENOENT") {
    throw e;
  }
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
    throw e;
  }
};

const retrieveAllData = async ({ filePath }) => {
  let data = [];
  let statusSummary = {};
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

      data.push(...dataJSON);
    }

    return {
      data,
      statusSummary,
    };
  } catch (e) {
    throw e;
  }
};
