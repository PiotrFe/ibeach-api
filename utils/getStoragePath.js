module.exports.getStoragePath = function () {
  if (process.env.STORAGE_MODE === "BOX") {
    const homedir = require("os").homedir();
    return `${homedir}\\Box Sync\\iBeach\\data_storage`;
  } else if (process.env.STORAGE_MODE === "LOCAL") {
    return process.env.RUNTIME_MODE === "EXE"
      ? path.join(path.dirname(process.execPath), `${process.env.STORAGE_DIR}`)
      : `${process.env.STORAGE_DIR}`;
  } else {
    throw new Error("Invalid storage configuration");
  }
};
