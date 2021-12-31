import { constants } from "fs";
import { writeFile, access, readFile } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const saveFile = async ({ weekTs, pdm, data, submit = false }) => {
  const folderPath = path.resolve(storageDir, "people", `${weekTs}`);
  const filePath = path.join(folderPath, `${pdm.toLowerCase()}.json`);

  try {
    await access(filePath, constants.R_OK | constants.W_OK);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }

  try {
    const fileContents = await readFile(filePath, "utf8");
    const dataJSON = JSON.parse(fileContents);
    const status = dataJSON.splice(dataJSON.length - 1, 1)[0];

    if (submit) {
      status.status = "done";
    }

    const updatedData = [...JSON.parse(data), status];

    return await writeFile(filePath, JSON.stringify(updatedData), "utf8");
  } catch (e) {
    throw new Error(e.message);
  }
};
