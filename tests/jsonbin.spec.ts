import { JsonbinController } from "../src/controllers/jsonbinController";
import { createBin, expectFail, cleanupBins } from "./helpers/jsonbin.helpers";

jest.setTimeout(60000);

describe("JSONBin API Integration Tests", () => {
  const controller = new JsonbinController();
  const createdIds: string[] = [];

  afterAll(async () => {
    await cleanupBins(controller, createdIds);
  });

  describe("POST /b", () => {

    test("POST-1: create bin returns id", async () => {
      const id = await createBin(controller, createdIds, { value: 1 });
      expect(id).toBeTruthy();
    });

    test("POST-2: create nested object", async () => {
      const id = await createBin(controller, createdIds, {
        obj: { a: 1 }
      });
      expect(id).toBeTruthy();
    });

    test("POST-3: create object with array", async () => {
      const id = await createBin(controller, createdIds, {
        arr: [1, 2, 3]
      });
      expect(id).toBeTruthy();
    });

    test("POST-4: create bin with custom name", async () => {
      const id = await createBin(
        controller,
        createdIds,
        { value: "custom" },
        "custom-bin"
      );
      expect(id).toBeTruthy();
    });

    test("POST-5: create object with long text", async () => {
      const id = await createBin(controller, createdIds, {
        text: "hello".repeat(222)
      });
      expect(id).toBeTruthy();
    });

  });

  describe("GET /b/:id", () => {

     test("GET-1: read existing bin returns 200 and correct data", async () => {
      // ✅ Combined teacher-commented equivalent tests into one
      const payload = { name: "Lena" };
      const id = await createBin(controller, createdIds, payload);

      const res = await controller.readBin(id);

      expect(res.status).toBe(200);
      expect(res.body.record.name).toBe("Lena");
    });

    test("GET-2: read non-existing returns 404", async () => {
      await expectFail(() => controller.readBin("ffffffffffffffffffffffff"), 404);
    });

    test("GET-3: read bin created with custom name returns metadata name (if available)", async () => {
      const createRes = await controller.createBin(
        { x: 1 },
        { name: "named-bin" }
      );

      expect([200, 201]).toContain(createRes.status);

      const id = createRes.body?.metadata?.id;
      expect(id).toBeTruthy();
      createdIds.push(id);

      const readRes = await controller.readBin(id);
      expect(readRes.status).toBe(200);
      if (readRes.body?.metadata?.name !== undefined) {
        expect(readRes.body.metadata.name).toBe("named-bin");
      }
    });

    test("GET-4: read complex object", async () => {
      const id = await createBin(controller, createdIds, { obj: { a: "b" } });

      const res = await controller.readBin(id);
      expect(res.body.record.obj.a).toBe("b");
    });
  });
  describe("PUT /b/:id", () => {

    test("PUT-1: update existing bin returns 200", async () => {
      const id = await createBin(controller, createdIds, { x: 1 });

      const res = await controller.putBin(id, { updated: true });

      expect(res.status).toBe(200);
    });

    test("PUT-2: update replaces data", async () => {
      const id = await createBin(controller, createdIds, { x: 1 });

      await controller.putBin(id, { newValue: 123 });

      const res = await controller.readBin(id);
      expect(res.body.record.newValue).toBe(123);
    });

    test("PUT-3: empty object returns 400", async () => {
      const id = await createBin(controller, createdIds, { x: 1 });

      await expectFail(() => controller.putBin(id, {}), 400);
    });

    test("PUT-4: update non-existing returns 404", async () => {
      await expectFail(
        () => controller.putBin("ffffffffffffffffffffffff", { x: 1 }),
        404
      );
    });

    test("PUT-5: update nested object", async () => {
      const id = await createBin(controller, createdIds, { a: 1 });

      await controller.putBin(id, { obj: { a: 2 } });

      const res = await controller.readBin(id);
      expect(res.body.record.obj.a).toBe(2);
    });

  });

  describe("DELETE /b/:id", () => {

    test("DELETE-1: delete existing returns 200/204", async () => {
      const id = await createBin(controller, createdIds, { x: 1 });

      const res = await controller.deleteBin(id);
      expect([200, 204]).toContain(res.status);
    });

    test("DELETE-2: delete non-existing returns 404", async () => {
      await expectFail(
        () => controller.deleteBin("ffffffffffffffffffffffff"),
        404
      );
    });

    test("DELETE-3: create and delete multiple bins", async () => {
      const id1 = await createBin(controller, createdIds, { a: 1 });
      const id2 = await createBin(controller, createdIds, { a: 2 });

      await controller.deleteBin(id1);
      await controller.deleteBin(id2);

      await expectFail(() => controller.readBin(id1), 404);
      await expectFail(() => controller.readBin(id2), 404);
    });

    test("DELETE-4: delete bin created with custom name", async () => {
      const id = await createBin(controller, createdIds, { x: 1 }, "custom");

      const res = await controller.deleteBin(id);
      expect([200, 204]).toContain(res.status);
    });

    test("DELETE-5: after delete GET returns 404", async () => {
      const id = await createBin(controller, createdIds, { x: 123 });

      await controller.deleteBin(id);

      await expectFail(() => controller.readBin(id), 404);
    });

  });

});