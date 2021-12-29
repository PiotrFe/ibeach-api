import { constants } from "fs";
import { fileURLToPath } from "url";
import { access, readdir, readFile } from "fs/promises";
import path from "path";

const baseDir = "../data_storage/";

export const retrieveData = async (weekTs) => {
  const currentPath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentPath);

  const filePath = path.resolve(
    currentDir,
    "..",
    "data_storage",
    "people",
    `${weekTs}`
  );
  let data = [];
  let statusSummary = {};

  try {
    await access(filePath, constants.R_OK);
  } catch (e) {
    console.log(e);
    throw new Error("No data available");
  }

  try {
    const files = await readdir(filePath);

    for (let file of files) {
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
    console.log(e);
    throw new Error("Unable to access data");
  }
};
