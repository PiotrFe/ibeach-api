import { constants } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { Buffer } from "buffer";

export const storeFile = async ({ weekTs, data }) => {
  const dir = "./data_storage/master";

  try {
    const fileName = `${weekTs}.csv`;
    const savePath = path.join(dir, fileName);
    const dataBin = new Uint8Array(Buffer.from(data));

    return await writeFile(savePath, dataBin);
  } catch (err) {
    throw new Error();
  }
};
