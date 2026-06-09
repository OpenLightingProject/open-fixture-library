import { resolve } from "path";
import type { H3Event } from "h3";
import JSZip from "jszip";
import { readFile } from "fs/promises";
import Fixture from "~~/lib/model/Fixture.js";
import Manufacturer from "~~/lib/model/Manufacturer.js";
import {
  fixtureFromRepository,
  embedResourcesIntoFixtureJson,
} from "~~/lib/model.js";

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
    const json = JSON.parse(
      await readFile(
        resolve("fixtures", `${manufacturerKey}/${fixtureKey}.json`),
        "utf-8",
      ),
    );
    await embedResourcesIntoFixtureJson(json);
    setResponseHeader(event, "Content-Type", "application/json");
    setResponseStatus(event, 200);
    return json;
  }

  const exportPlugins = await getExportPlugins();
  if (!exportPlugins.includes(format)) {
    return;
  }

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
): Promise<string | Buffer> {
  const exportPlugins = await getExportPlugins();
  if (!exportPlugins.includes(format)) {
    throw createError({
      statusCode: 500,
      statusMessage: `Exporting fixture with ${format} failed: Plugin is not supported.`,
    });
  }

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
  fixtures: InstanceType<typeof Fixture>[],
  zipName: string,
  errorDesc: string,
): Promise<string | Buffer> {
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
    throw createError({
      statusCode: 500,
      statusMessage: `Exporting ${errorDesc} with ${pluginKey} failed: ${error.toString()}`,
    });
  }
}
