import { sentenceCase } from "change-case"
import { userInfo } from "os"

import type { ExtensionManifest } from "@plasmo/constants"

import type { PackageManagerInfo } from "~features/helpers/package-manager"

export const generatePackage = ({
  name = "plasmo-extension",
  version = "0.0.0",
  packageManager = null as PackageManagerInfo
}) => {
  const baseData = {
    name,
    displayName: sentenceCase(name),
    version,
    description: "A basic Plasmo extension.",
    author: userInfo().username,

    packageManager: "",
    scripts: {
      dev: "plasmo dev",
      build: "plasmo build"
    },
    dependencies: {
      react: "18.1.0",
      "react-dom": "18.1.0"
    },
    devDependencies: {
      "@trivago/prettier-plugin-sort-imports": "3.2.0",
      "@types/chrome": "0.0.186",
      "@types/node": "17.0.34",
      "@types/react": "18.0.9",
      "@types/react-dom": "18.0.4",
      plasmo: "latest",
      prettier: "2.6.2",
      typescript: "4.6.4"
    },
    manifest: {
      // permissions: [] as ValidManifestPermission[],
      host_permissions: ["https://*/*"]
    } as ExtensionManifest
  }

  if (!packageManager || !packageManager.version) {
    delete baseData.packageManager
  } else {
    baseData.packageManager = `${packageManager.name}@${packageManager.version}`
  }

  return baseData
}

export type PackageJSON = ReturnType<typeof generatePackage>
