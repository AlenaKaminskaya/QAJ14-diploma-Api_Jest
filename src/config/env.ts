import dotenv from "dotenv";

dotenv.config();

export const env = {
  baseUrl: process.env.JSONBIN_BASE_URL ?? "https://api.jsonbin.io/v3",
  masterKey: process.env.JSONBIN_MASTER_KEY ?? "",
};

if (!env.masterKey) {
  throw new Error("JSONBIN_MASTER_KEY is missing in .env");
}
