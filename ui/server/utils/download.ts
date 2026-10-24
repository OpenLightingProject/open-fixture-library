import { resolve } from "path";
import { pathToFileURL } from "url";
import type { H3Event } from "h3";
import JSZip from "jszip";
import { readFile } from "fs/promises";

/**
 * `import.meta.url` is rewritten to the Nitro entry chunk in bundled server
 * code, so the model's fixture and resource lookups would resolve against
 * `.output/` instead of the repository root. Load the model from its real
 * source location at runtime, like `ui/server/utils/api.ts` does for the API
 * route handlers.
 */
const modelPromise = import(
  pathToFileURL(resolve(process.cwd(), "lib/model.js")).href,
);
const modelClassesPromise = Promise.all([
  import(pathToFileURL(resolve(process.cwd(), "lib/model/Fixture.js")).href),
  import(pathToFileURL(resolve(process.cwd(), "lib/model/Manufacturer.js")).href),
]).then(([fixtureModule, manufacturerModule]) => ({
  Fixture: fixtureModule.default,
  Manufacturer: manufacturerModule.default,
}));

interface RegisterEntry {
  name: string;
  lastActionDate: string;
  lastAction: "created" | "modified";
  redirectTo?: string;
  reason?: "SameAsDifferentBrand" | "FixtureRenamed";
}

interface EditorBody {
  fixtures: Record<string, Record<string, unknown>>;
  manufacturers: Record<string, Record<string, unknown>>;
}

let exportPluginsCache: string[] | null = null;
let registerCache: { filesystem: Record<string, RegisterEntry> } | null = null;

/**
 * Send a download error exactly like the old Express handler did: a plain-text
 * 500 response without a `Content-Type` header. `createError` would render a
 * JSON error body with a different status message instead.
 */
function sendPlainTextError(event: H3Event, message: string): void {
  setResponseStatus(event, 500);
  event.node.res.write(message);
  event.node.res.end();
}

async function getExportPlugins(): Promise<string[]> {
  if (!exportPluginsCache) {
    exportPluginsCache = JSON.parse(
      await readFile(resolve("plugins", "plugins.json"), "utf-8"),
    ).exportPlugins;
  }
  return exportPluginsCache;
}

async function getRegister(): Promise<{
  filesystem: Record<string, RegisterEntry>;
}> {
  if (!registerCache) {
    registerCache = JSON.parse(
      await readFile(resolve("fixtures", "register.json"), "utf-8"),
    );
  }
  return registerCache;
}

export async function handleBatchDownload(
  event: H3Event,
  format: string,
): Promise<string | Buffer | undefined> {
  const exportPlugins = await getExportPlugins();
  if (!exportPlugins.includes(format)) {
    return;
  }

  const { fixtureFromRepository } = await modelPromise;
  const register = await getRegister();
  const fixtures = await Promise.all(
    Object.keys(register.filesystem)
      .filter(
        (fixtureKey) =>
          !("redirectTo" in register.filesystem[fixtureKey]) ||
          register.filesystem[fixtureKey].reason === "SameAsDifferentBrand",
      )
      .map((fixtureKey) => {
        const [manufacturerKey, key] = fixtureKey.split("/");
        return fixtureFromRepository(manufacturerKey, key);
      }),
  );

  return downloadFixtures(event, format, fixtures, format, "all fixtures");
}

export async function handleFixtureDownload(
  event: H3Event,
  manufacturerKey: string,
  fixtureKey: string,
  format: string,
): Promise<string | Buffer | Record<string, unknown> | undefined> {
  const register = await getRegister();
  if (!(`${manufacturerKey}/${fixtureKey}` in register.filesystem)) {
    return;
  }

  if (format === "json") {
    const { embedResourcesIntoFixtureJson } = await modelPromise;
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(
        await readFile(
          resolve("fixtures", `${manufacturerKey}/${fixtureKey}.json`),
          "utf-8",
        ),
      );
      await embedResourcesIntoFixtureJson(json);
    } catch (error) {
      sendPlainTextError(
        event,
        `Fetching ${manufacturerKey}/${fixtureKey}.json failed: ${error.toString()}`,
      );
      return;
    }

    setResponseHeader(event, "Content-Type", "application/json");
    setResponseStatus(event, 200);
    // The Nuxt 2 oracle sends compact JSON; returning the object here would let
    // Nitro pretty-print it and change the downloaded file byte-for-byte.
    return JSON.stringify(json);
  }

  const exportPlugins = await getExportPlugins();
  if (!exportPlugins.includes(format)) {
    return;
  }

  const { fixtureFromRepository } = await modelPromise;
  const fixtures = [await fixtureFromRepository(manufacturerKey, fixtureKey)];
  return downloadFixtures(
    event,
    format,
    fixtures,
    `${manufacturerKey}_${fixtureKey}_${format}`,
    `fixture ${manufacturerKey}/${fixtureKey}`,
  );
}

export async function handleEditorDownload(
  event: H3Event,
  format: string,
): Promise<string | Buffer | undefined> {
  const exportPlugins = await getExportPlugins();
  if (!exportPlugins.includes(format)) {
    sendPlainTextError(
      event,
      `Exporting fixture with ${format} failed: Plugin is not supported.`,
    );
    return;
  }

  const [{ embedResourcesIntoFixtureJson }, { Fixture, Manufacturer }] = await Promise.all([
    modelPromise,
    modelClassesPromise,
  ]);
  const body = await readBody<EditorBody>(event);
  const fixtures = await Promise.all(
    Object.entries(body.fixtures).map(async ([key, jsonObject]) => {
      const [manufacturerKey, fixtureKey] = key.split("/");
      const manufacturer = new Manufacturer(
        manufacturerKey,
        body.manufacturers[manufacturerKey],
      );
      await embedResourcesIntoFixtureJson(jsonObject);
      return new Fixture(manufacturer, fixtureKey, jsonObject);
    }),
  );

  let zipName: string;
  let errorDesc: string;
  if (fixtures.length === 1) {
    zipName = `${fixtures[0].manufacturer.key}_${fixtures[0].key}_${format}`;
    errorDesc = `fixture ${fixtures[0].manufacturer.key}/${fixtures[0].key}`;
  } else {
    zipName = format;
    errorDesc = `${fixtures.length} fixtures`;
  }

  return downloadFixtures(event, format, fixtures, zipName, errorDesc);
}

export async function downloadFixtures(
  event: H3Event,
  pluginKey: string,
  fixtures: unknown[],
  zipName: string,
  errorDesc: string,
): Promise<string | Buffer | undefined> {
  const plugin = await import(resolve("plugins", pluginKey, "export.js"));

  try {
    const files = await plugin.exportFixtures(fixtures, {
      baseDirectory: resolve("."),
      date: new Date(),
    });

    if (files.length === 1) {
      const file = files[0];
      setResponseHeader(event, "Content-Type", file.mimetype);
      setResponseHeader(
        event,
        "Content-Disposition",
        `attachment; filename="${file.name}"`,
      );
      setResponseStatus(event, 200);
      return file.content;
    }

    const archive = new JSZip();
    for (const file of files) {
      archive.file(file.name, file.content);
    }

    const zipBuffer = await archive.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    setResponseHeader(event, "Content-Type", "application/zip");
    setResponseHeader(
      event,
      "Content-Disposition",
      `attachment; filename="ofl_export_${zipName}.zip"`,
    );
    setResponseStatus(event, 200);
    return zipBuffer;
  } catch (error) {
    sendPlainTextError(
      event,
      `Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}`,
    );
    return;
  }
}
