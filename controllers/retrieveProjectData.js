import { constants } from "fs";
import { access, readdir, readFile } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const retrieveProjectData = async ({ weekTs }) => {
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

    return { data };
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
};
