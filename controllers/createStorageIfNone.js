const { constants } = require("fs");
const { writeFile, access, mkdir } = require("fs/promises");
const path = require("path");
const { getStoragePath } = require("../utils/getStoragePath.js");

let storageDir;

try {
  storageDir = getStoragePath();
} catch (e) {
  console.log(e);
  throw new Error(e.message);
}


module.exports.createStorageIfNone = async function ({ weekTs }) {
  const masterDir = path.join(storageDir, "master");
  const peopleDir = path.join(storageDir, "people", `${weekTs}`);
  const projectDir = path.join(storageDir, "projects", `${weekTs}`);

  for (let dir of [storageDir, masterDir, peopleDir, projectDir]) {
    try {
      await access(dir, constants.R_OK | constants.W_OK);
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log(`Creating dir: ${dir}`);
        await mkdir(dir, { recursive: true });
      } else {
        throw new Error(e.message);
      }
    }
  }
};
