import { readJson } from "fs-extra"
import { resolve } from "path"
import { cwd } from "process"
import semver from "semver"

import { fileExists } from "@plasmo/utils"

import type { BaseFactory } from "./base"

const supportedUILibraries = ["react", "svelte", "vue"] as const

type SupportedUILibraryName = typeof supportedUILibraries[number]

const supportedUIExt = [".tsx", ".svelte", ".vue"] as const

export type SupportedUIExt = typeof supportedUIExt[number]

export type UILibrary = {
  name: SupportedUILibraryName
  path: `${SupportedUILibraryName}${number}`
  version: number
}

const uiLibraryError = `No supported UI library found.  You can file an RFC for a new UI Library here: https://github.com/PlasmoHQ/plasmo/issues`

const getMajorVersion = async (version: string) => {
  if (version.includes(":")) {
    const [protocol, versionData] = version.split(":")
    switch (protocol) {
      case "file":
      default:
        const packageJson = await readJson(
          resolve(cwd(), versionData, "package.json")
        )
        return semver.major(packageJson.version)
    }
  } else {
    return semver.major(version)
  }
}

export const getUILibrary = async (
  plasmoManifest: BaseFactory
): Promise<UILibrary> => {
  const baseLibrary = supportedUILibraries.find(
    (l) => l in plasmoManifest.dependencies
  )

  if (baseLibrary === undefined) {
    throw new Error(uiLibraryError)
  }

  const majorVersion = await getMajorVersion(
    plasmoManifest.dependencies[baseLibrary]
  )

  // React lower than 18 can uses 17 scaffold
  if (baseLibrary === "react" && majorVersion < 18) {
    return {
      name: baseLibrary,
      path: "react17",
      version: majorVersion
    }
  }

  const uiLibraryPath = `${baseLibrary}${majorVersion}` as const

  const staticPath = resolve(
    plasmoManifest.templatePath.staticTemplatePath,
    uiLibraryPath
  )

  if (!(await fileExists(staticPath))) {
    throw new Error(uiLibraryError)
  }

  return {
    name: baseLibrary,
    path: uiLibraryPath,
    version: majorVersion
  }
}
