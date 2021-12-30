import { constants } from "fs";
import { fileURLToPath } from "url";
import { access, readdir, readFile } from "fs/promises";
import path from "path";

const currentPath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentPath);
const baseDir = path.resolve(currentDir, "..", "data_storage");

export const retrieveData = async (weekTs) => {
  const filePath = path.resolve(baseDir, "people", `${weekTs}`);
  let data = [];
  let statusSummary = {};

  try {
    await access(filePath, constants.R_OK);
  } catch (e) {
    console.log(e);
    throw new Error("No data");
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

    const lookupTable = await readFile(
      path.join(baseDir, "lookup.json"),
      "utf8"
    );

    return {
      data,
      statusSummary,
      lookupTable: JSON.parse(lookupTable),
    };
  } catch (e) {
    throw new Error(e);
  }
};
