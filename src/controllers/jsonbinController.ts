import request, { Response } from "superagent";
import { env } from "../config/env";

type JsonBody = Record<string, unknown>;

type CreateBinOptions = {
  name?: string;
  private?: boolean;
  collection?: string;
};

export class JsonbinController {
  private baseUrl = env.baseUrl;
  private masterKey = env.masterKey;

  private headers() {
    return {
      "Content-Type": "application/json",
      "X-Master-Key": this.masterKey,
    };
  }

  async createBin(record: JsonBody, options?: CreateBinOptions): Promise<Response> {
    const req = request
      .post(this.baseUrl + "/b")
      .set(this.headers());

    if (options?.name) {
      req.set("X-Bin-Name", options.name);
    }

    return req.send(record);
  }

  async readBin(binId: string): Promise<Response> {
    return request
      .get(this.baseUrl + `/b/${binId}`)
      .set(this.headers());
  }

  async putBin(binId: string, record: JsonBody): Promise<Response> {
    return request
      .put(this.baseUrl + `/b/${binId}`)
      .set(this.headers())
      .send(record);
  }

  async deleteBin(binId: string): Promise<Response> {
    return request
      .delete(this.baseUrl + `/b/${binId}`)
      .set(this.headers());
  }
}