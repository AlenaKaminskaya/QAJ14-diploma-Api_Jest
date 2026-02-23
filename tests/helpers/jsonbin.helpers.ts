import { JsonbinController } from "../../src/controllers/jsonbinController";


type JsonBody = Record<string, unknown>;


export async function createBin(
  controller: JsonbinController,
  createdIds: string[],
  payload: JsonBody,
  name?: string
): Promise<string> {
const res = await controller.createBin(payload, name ? { name } : undefined);

  expect([200, 201]).toContain(res.status);

  const id = res.body?.metadata?.id;
  expect(id).toBeTruthy();

  createdIds.push(id);
  return id;
}


export async function expectFail(
  fn: () => Promise<unknown>,
  expectedStatus: number
): Promise<void> {
  try {
    await fn();
    throw new Error(`Expected request to fail with status ${expectedStatus}`);
  } catch (err: unknown) {

    const e = err as { status?: number };
    expect(e.status).toBe(expectedStatus);
  }
}

export async function cleanupBins(
  controller: JsonbinController,
  createdIds: string[]
): Promise<void> {
  await Promise.all(
    createdIds.map(async (id) => {
      try {
        await controller.deleteBin(id);
      } catch {
        // ignore
      }
    })
  );
}