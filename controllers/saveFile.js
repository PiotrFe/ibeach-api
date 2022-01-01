import { constants } from "fs";
import { writeFile, access, readFile, appendFile, open } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const saveFile = async ({ weekTs, pdm, data, submit = false }) => {
  const folderPath = path.resolve(storageDir, "people", `${weekTs}`);

  if (pdm === "allocator") {
    try {
      return await saveToReadyFile({ weekTs, data, overwrite: true });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

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

      await saveToReadyFile({ weekTs, data });
    }

    const updatedData = [...JSON.parse(data), status];

    return await writeFile(filePath, JSON.stringify(updatedData), "utf8");
  } catch (e) {
    throw new Error(e.message);
  }
};

const saveToReadyFile = async ({ weekTs, data, overwrite = false }) => {
  const folderPath = path.resolve(storageDir, "people", `${weekTs}`);
  const readyFilePath = path.join(folderPath, "ready.json");

  try {
    await access(readyFilePath, constants.R_OK | constants.W_OK);
  } catch (e) {
    try {
      await open(readyFilePath, "w");
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  if (overwrite) {
    return await writeFile(path.join(folderPath, "ready.json"), data, "utf8");
  }

  const submittedData = await readFile(
    path.join(folderPath, "ready.json"),
    "utf8"
  );

  const updatedData = submittedData
    ? [...JSON.parse(submittedData), ...JSON.parse(data)]
    : [...JSON.parse(data)];

  return await writeFile(
    path.join(folderPath, "ready.json"),
    JSON.stringify(updatedData),
    "utf8"
  );
};
