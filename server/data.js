import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getContext(files) {
  let context = "";

  for (const file of files) {
    try {
      const filePath = path.join(__dirname, "readmes", file);
      const content = await fs.readFile(filePath, "utf8");
      context += `---------- ${file} ----------\n${content}\n---------- END-${file} ----------\n`;
    } catch (error) {
      logger.error(`Error reading file ${file}`, { error, file });
    }
  }

  return context;
}

export { getContext };
