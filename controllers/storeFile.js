import { constants } from "fs";
import { writeFile, access, mkdir } from "fs/promises";
import path from "path";
import { Buffer } from "buffer";

const baseDir = "./data_storage/";

export const storeFile = async ({ weekTs, data }) => {
  const dir = path.join(baseDir, "master");
  let week, full;

  try {
    ({ week, full } = JSON.parse(data));
  } catch (e) {
    console.log(e);
    return Promise.reject("Unable to read file");
  }

  try {
    const fileName = `${weekTs}.csv`;
    const savePath = path.join(dir, fileName);

    await writeFile(savePath, JSON.stringify(week));
    await saveListForLookup(full);
    return await saveSplitFilesForPDMs(weekTs, week);
  } catch (err) {
    console.log(err);
    throw new Error();
  }
};

const saveSplitFilesForPDMs = async (weekTs, data) => {
  const dir = path.join(baseDir, "people", weekTs);

  try {
    await access(dir, constants.R_OK | constants.W_OK);
  } catch (e) {
    await mkdir(dir);
  }

  const dataPerPDM = {};
  data.forEach((item) => {
    const { pdm } = item;

    if (dataPerPDM[pdm]) {
      dataPerPDM[pdm].push(item);
    } else {
      dataPerPDM[pdm] = [item];
    }
  });

  try {
    await Promise.all(
      Object.entries(dataPerPDM).map(async ([pdm, data]) => {
        // pushing list status to the end of the arr
        const status = {
          pdm,
          status: "pending",
        };
        data.push(status);
        const savePath = path.join(dir, `${pdm.toLowerCase()}.json`);
        return await writeFile(savePath, JSON.stringify(data));
      })
    );
  } catch (e) {
    throw new Error(e);
  }
};

const saveListForLookup = async (data) => {
  try {
    await writeFile(path.join(baseDir, "lookup.json"), JSON.stringify(data));
  } catch (e) {
    throw new Error(e);
  }
};
