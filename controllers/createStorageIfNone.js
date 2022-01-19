const { constants } = require("fs");
const { writeFile, access, mkdir } = require("fs/promises");
const path = require("path");
const storageDir =
  process.env.RUNTIME_MODE === "EXE"
    ? path.join(path.dirname(process.execPath), `${process.env.STORAGE_DIR}`)
    : `${process.env.STORAGE_DIR}`;

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
