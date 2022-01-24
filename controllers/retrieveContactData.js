const { constants } = require("fs");
const { access, readdir, readFile } = require("fs/promises");
const path = require("path");
const { getStoragePath } = require("../utils/getStoragePath.js");

let storageDir;

try {
  storageDir = getStoragePath();
} catch (e) {
  console.log(e);
  throw new Error(e.message);
}

module.exports.retrieveContactData = async function () {
  const contactsFile = path.join(storageDir, "contacts.csv");

  try {
    return await readFile(contactsFile, "utf8");
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
};
