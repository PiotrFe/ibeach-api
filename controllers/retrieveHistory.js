const path = require("path");
const { readdir } = require("fs/promises");
const { createReadStream } = require("fs");
const { pipeline, PassThrough, Transform, Readable } = require("stream");
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { streamValues } = require("stream-json/streamers/StreamValues");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { Interface } = require("../utils/interface");

const { getStoragePath } = require("../utils/getStoragePath.js");

module.exports.retrieveHistory = async function retrieveHistory(fromTs, toTs) {
  let storageDir;

  try {
    storageDir = getStoragePath();
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }

  const folderNameRegex = /^\d+$/;
  const projectDirContent = await readdir(path.join(storageDir, "projects"));
  const projectFolders = projectDirContent.filter((folderName) => {
    const nameMatch = folderNameRegex.test(folderName);
    const iFolderName = parseInt(folderName);
    const rangeMatch =
      iFolderName >= parseInt(fromTs) && iFolderName <= parseInt(toTs);

    return nameMatch && rangeMatch;
  });

  const aggregatedData = new AllocationAggregator();

  return new Promise((resolve, reject) => {
    for (let folder of projectFolders) {
      const pipeline = chain([
        createReadStream(
          path.join(storageDir, "projects", folder, `${folder}.json`),
          {
            encoding: "utf-8",
          }
        ),
        parser(),
        streamValues(),
        (data) => {
          return data.value;
        },
      ]);

      pipeline.on("data", (data) => {
        aggregatedData.addRecord(data);
      });
      pipeline.on("error", (err) => {
        reject(err.message);
      });
      pipeline.on("end", () => {
        resolve(aggregatedData.getData());
      });
    }
  });
};

const AllocationAggregator = (function () {
  const IProjectRecord = new Interface(
    "projectRecord",
    [],
    ["client", "week", "leadership", "tags"]
  );

  const priv = new WeakMap();
  function _(instance) {
    return priv.get(instance);
  }

  class AggregatorClass {
    constructor() {
      const privMembers = {
        aggregatedData: {},
      };

      priv.set(this, privMembers);
    }

    addRecord(record) {
      IProjectRecord.isImplementedBy(record);

      const { client, week, tags, leadership } = record;

      if (!_(this).aggregatedData[client]) {
        _(this).aggregatedData[client] = {
          days: {
            got: 0,
            asked: 0,
          },
        };
      }

      Object.values(week).forEach((value) => {
        if (value === true || value.id) {
          _(this).aggregatedData[client].days.asked++;
        }
        if (value.id) {
          _(this).aggregatedData[client].days.got++;
        }
      });
    }

    getData() {
      return _(this).aggregatedData;
    }
  }

  return AggregatorClass;
})();
