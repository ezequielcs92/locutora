import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Cargar los módulos TS con dependencias simuladas: nunca conecta a Supabase real.
function loadModule(file, mocks = {}) {
  const filename = fileURLToPath(new URL(`../${file}`, import.meta.url));
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  const context = vm.createContext({
    exports,
    process: { env: { NODE_ENV: "test" } },
    console: { error() {}, warn() {} },
    require(id) {
      if (id in mocks) return mocks[id];
      throw new Error(`Dependencia no simulada: ${id}`);
    },
  });
  vm.runInContext(compiled, context, { filename });
  return exports;
}

const collections = loadModule("lib/video-collections.ts");
const input = {
  title: "Demo de prueba",
  description: null,
  platform: "youtube",
  videoId: "abcdefghijk",
  isPublished: true,
};

function mockDatabase(result = { data: [], error: null, count: 2 }) {
  const calls = [];
  const client = {
    from(table) {
      calls.push(["from", table]);
      const query = {};
      for (const method of ["select", "insert", "update", "delete", "eq", "order"]) {
        query[method] = (...args) => {
          calls.push([method, ...args]);
          return query;
        };
      }
      query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      return query;
    },
  };
  return { calls, client };
}

function mockActions({ authenticated = true, result } = {}) {
  const db = mockDatabase(result);
  const paths = [];
  const actions = loadModule("app/admin/actions.ts", {
    "next/cache": { revalidatePath: (value) => paths.push(value) },
    "next/headers": {},
    "next/navigation": {},
    "@/lib/admin-auth": { getAdminSession: async () => authenticated ? { email: "test@example.com" } : null },
    "@/lib/env": { isR2Configured: () => false },
    "@/lib/r2": {},
    "@/lib/supabase/admin": { createAdminClient: () => db.client },
    "@/lib/utils": {},
    "@/lib/video-collections": collections,
  });
  return { actions, paths, calls: db.calls };
}

const mutations = [
  ["createVideo", [input]],
  ["updateVideo", ["item-1", input]],
  ["toggleVideoPublished", ["item-1", false]],
  ["deleteVideo", ["item-1"]],
  ["reorderVideos", [["item-2", "item-1"]]],
];

for (const collection of ["videos", "works"]) {
  for (const [method, args] of mutations) {
    test(`${method}: ${collection} no toca la otra colección y revalida su ruta`, async () => {
      const { actions, paths, calls } = mockActions();
      assert.equal((await actions[method](...args, collection)).ok, true);
      const tables = calls.filter(([operation]) => operation === "from").map(([, table]) => table);
      assert.ok(tables.length > 0);
      assert.ok(tables.every((table) => table === collection));
      assert.deepEqual(paths, ["/", collection === "works" ? "/admin/trabajos" : "/admin/videos"]);
    });
  }
}

test("los llamados existentes siguen usando videos por defecto", async () => {
  const { actions, calls } = mockActions();
  assert.equal((await actions.createVideo(input)).ok, true);
  assert.ok(calls.filter(([op]) => op === "from").every(([, table]) => table === "videos"));
});

for (const [method, args] of mutations) {
  test(`${method}: rechaza colección arbitraria y no consulta ninguna tabla`, async () => {
    const { actions, calls } = mockActions();
    assert.equal((await actions[method](...args, "demos")).ok, false);
    assert.equal(calls.length, 0);
  });

  test(`${method}: exige sesión para trabajos`, async () => {
    const { actions, calls } = mockActions({ authenticated: false });
    assert.equal((await actions[method](...args, "works")).ok, false);
    assert.equal(calls.length, 0);
  });
}

test("un error de base se informa sin revalidar como si hubiera guardado", async () => {
  const { actions, paths } = mockActions({ result: { error: { message: "Tabla no disponible" } } });
  const result = await actions.createVideo(input, "works");
  assert.equal(result.ok, false);
  assert.equal(result.error, "Tabla no disponible");
  assert.deepEqual(paths, []);
});

function mockPublicData(result, configured = true) {
  const db = mockDatabase(result);
  const data = loadModule("lib/data.ts", {
    "./env": { isSupabaseConfigured: () => configured },
    "./r2": {},
    "./supabase/public": { createPublicClient: () => db.client },
    "./video-collections": collections,
  });
  return { data, calls: db.calls };
}

for (const [method, table] of [["getPublicVideos", "videos"], ["getPublicWorks", "works"]]) {
  test(`${method}: consulta solo publicados, con orden y mapeo correcto`, async () => {
    const { data, calls } = mockPublicData({
      error: null,
      data: [{ id: "1", title: table, description: null, platform: "youtube", video_id: "abcdefghijk" }],
    });
    const items = await data[method]();
    assert.equal(items.length, 1);
    assert.equal(items[0].videoId, "abcdefghijk");
    assert.equal(items[0].title, table);
    assert.deepEqual(calls.filter(([op]) => op === "from"), [["from", table]]);
    assert.ok(calls.some(([op, key, value]) => op === "eq" && key === "is_published" && value === true));
    assert.ok(calls.some(([op, key]) => op === "order" && key === "sort_order"));
  });

  test(`${method}: sin credenciales o sin tabla devuelve vacío, nunca mocks`, async () => {
    const missingConfig = mockPublicData(undefined, false);
    assert.equal((await missingConfig.data[method]()).length, 0);
    assert.equal(missingConfig.calls.length, 0);
    const missingTable = mockPublicData({ error: { message: "relation does not exist" } });
    assert.equal((await missingTable.data[method]()).length, 0);
  });
}
