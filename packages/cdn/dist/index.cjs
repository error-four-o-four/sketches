'use strict';

var np = require('node:path');
var nfs = require('node:fs');
var utils = require('@internal/utils');

const filename = "libs.json";
const url = {
  base: "https://cdnjs.cloudflare.com/ajax/libs",
  api: "https://api.cdnjs.com/libraries"
};
const fields = {
  initial: ["name", "version", "filename", "sri"],
  version: ["name", "sri"]
};

function createLibraryKeys(data) {
  const libs = Object.entries(data);
  const keys = /* @__PURE__ */ new Set();
  libs.forEach(([key, lib]) => {
    const { filename } = lib;
    const versions = Object.keys(lib.versions);
    for (const version of versions) {
      const src = `/${key}/${version}/${filename}`;
      keys.add(src);
    }
  });
  return keys;
}
async function fetchLibraryData(name, version) {
  const base = version ? `${name}/${version}` : name;
  const query = version ? fields.version : fields.initial;
  const request = `${url.api}/${base}?fields=${query.join(",")}`;
  console.log("Fetching data from %o ...", request);
  const json = await fetchRequest(request);
  if (!json) {
    console.log("Could not fetch library data!");
    process.exit(1);
  }
  if ("error" in json) {
    console.log(json.status, json.message);
    process.exit(1);
  }
  return json;
}
async function fetchRequest(request) {
  try {
    const data = await fetch(request);
    return await data.json();
  } catch (error) {
    utils.logError(error);
  }
  return null;
}
function parseFetchedData(data, version, filename) {
  filename = "filename" in data ? data.filename : filename;
  if (!filename) {
    throw new Error("Filename of %o is required!");
  }
  return {
    url: `${url.base}/${data.name}/${version}/${filename}`,
    sri: typeof data.sri === "string" ? data.sri : data.sri[filename]
  };
}

class LibHandler {
  path;
  file;
  data;
  keys;
  constructor(path) {
    this.path = path;
    this.file = np.join(path, filename);
    this.data = utils.parseJson(this.file) ?? {};
    this.keys = createLibraryKeys(this.data);
  }
  async createLibraryData(name, version) {
    const initialData = await fetchLibraryData(name, null);
    const versions = {};
    if (version && version !== initialData.version) {
      const versionData = await fetchLibraryData(name, version);
      versions[version] = parseFetchedData(versionData, version, initialData.filename);
    } else {
      versions[initialData.version] = parseFetchedData(initialData, initialData.version);
    }
    return {
      latest: initialData.version,
      filename: initialData.filename,
      versions,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  saveLibraryData(name, data) {
    this.data[name] = data;
    this.keys = createLibraryKeys(this.data);
    utils.writeJson(this.file, this.data);
  }
  isOutdated(data) {
    const updatedAt = new Date(data.updatedAt).valueOf();
    return Date.now() - updatedAt > 1e3 * 60 * 60 * 24 * 31;
  }
  async download(name, version, filename2) {
    const path = np.join(this.path, name, version);
    const file = np.resolve(path, filename2);
    if (nfs.existsSync(file)) {
      console.log(
        "Version %o of %o has already been downloaded",
        version,
        name
      );
      process.exit(0);
    }
    nfs.mkdirSync(path, { recursive: true });
    try {
      const url = this.data[name].versions[version].url;
      const data = await fetch(url);
      const lib = await data.text();
      nfs.writeFileSync(file, lib, "utf-8");
    } catch (error) {
      utils.logError(error);
      process.exit(1);
    }
  }
  async fetch(name, version) {
    if (!Object.hasOwn(this.data, name)) {
      const lib2 = await this.createLibraryData(name, version);
      if (!!version && version !== lib2.latest) {
        console.log("New version is available %o => %o", version, lib2.latest);
      }
      this.saveLibraryData(name, lib2);
      await this.download(name, version ?? lib2.latest, lib2.filename);
      return;
    }
    const lib = this.data[name];
    const isOutdated = this.isOutdated(lib);
    if (!version && isOutdated) {
      const fetched2 = await fetchLibraryData(name, null);
      if (fetched2.version !== lib.latest) {
        console.log("Downloading new version: %o => %o", lib.latest, fetched2.version);
        lib.latest = fetched2.version;
        lib.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        lib.versions[fetched2.version] = parseFetchedData(fetched2, fetched2.version);
        this.saveLibraryData(name, lib);
        await this.download(name, lib.latest, lib.filename);
        return;
      }
    }
    if (!version) {
      console.log("Version %o of %o has already been fetched", lib.latest, name);
      return;
    }
    if (version in lib.versions) {
      console.log("Version %o of %o has already been fetched", version, name);
      return;
    }
    const fetched = await fetchLibraryData(name, version);
    lib.versions[version] = parseFetchedData(fetched, version, lib.filename);
    this.saveLibraryData(name, lib);
    await this.download(name, version, lib.filename);
  }
  has(src) {
    return this.keys.has(src);
  }
  get(src) {
    if (!this.keys.has(src)) return null;
    const [lib, version] = src.slice(1).split("/");
    const data = lib in this.data ? this.data[lib] : null;
    if (!data) return null;
    return data.versions[version] ?? null;
  }
}

exports.LibHandler = LibHandler;
