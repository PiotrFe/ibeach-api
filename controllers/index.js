// export { storeFile } from "./storeFile.js";
// export { retrieveData } from "./retrieveData.js";
// export { saveFile } from "./saveFile.js";
// export { retrieveProjectData } from "./retrieveProjectData.js";
// export { saveProjectFile } from "./saveProjectFile.js";
// export { allocateToProject } from "./allocateToProject.js";
// export { createStorageIfNone } from "./createStorageIfNone.js";

const { storeFile } = require("./storeFile.js");
const { retrieveData } = require("./retrieveData.js");
const { saveFile } = require("./saveFile.js");
const { retrieveProjectData } = require("./retrieveProjectData.js");
const { saveProjectFile } = require("./saveProjectFile.js");
const { allocateToProject } = require("./allocateToProject.js");
// const { createStorageIfNone } = require("./createStorageIfNone.js");

module.exports = {
  storeFile,
  retrieveData,
  saveFile,
  retrieveProjectData,
  saveProjectFile,
  allocateToProject,
};
