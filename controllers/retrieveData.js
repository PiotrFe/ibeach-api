import { constants } from "fs";
import { access, readdir, readFile } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const retrieveData = async (weekTs, forPdm) => {
  const filePath = path.resolve(storageDir, "people", `${weekTs}`);
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

    // lookup file only to be sent on first fetch (with no pdm filter)
    const lookupTable = forPdm
      ? null
      : await readFile(path.join(storageDir, "lookup.json"), "utf8");

    return {
      data,
      statusSummary,
      ...(lookupTable && {
        lookupTable: JSON.parse(lookupTable),
      }),
    };
  } catch (e) {
    throw new Error(e);
  }
};
