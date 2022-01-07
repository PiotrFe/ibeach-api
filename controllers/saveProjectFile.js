import { constants } from "fs";
import { writeFile, access, readFile, open, mkdir } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const saveProjectFile = async ({ weekTs, data }) => {
  const folderPath = path.join(storageDir, "projects", `${weekTs}`);
  const filePath = path.join(folderPath, `${weekTs}.json`);

  let fileContents;

  try {
    await access(folderPath, constants.R_OK | constants.W_OK);
  } catch (e) {
    if (e.code === "ENOENT") {
      await mkdir(folderPath);
    } else {
      throw new Error(e.message);
    }
  }

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
