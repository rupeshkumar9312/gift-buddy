const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// npm workspaces hoist shared deps to the monorepo root — Metro needs to
// know to watch and resolve from there too, or it won't find them.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// react-native (hoisted to the workspace root, since it's the only version
// in the tree) internally requires "react" and, via normal node_modules
// walk-up from its own location, finds the ROOT's react — which apps/web
// and apps/admin pin to a different exact version than react-native's
// renderer was built against. React 19 requires the renderer and "react"
// to be the *exact* same build, not just semver-compatible, so two
// different "react" instances in one bundle throws at runtime ("Invalid
// hook call" / "Incompatible React versions"). npm `overrides` proved
// unreliable at forcing a correctly-nested copy here across repeated
// clean installs, so this pins it directly at the actual point of
// failure. Note: `extraNodeModules` is only a *fallback* Metro consults
// when normal resolution fails — since "react" resolves successfully
// (just to the wrong copy), that config key is silently never consulted.
// `resolveRequest` actually intercepts every resolution, which is what's
// needed to force this app's own nested react/react-dom regardless of
// what npm's hoisting produced.
// Matches "react"/"react-dom" AND their subpaths (react/jsx-runtime,
// react-dom/client, react-dom/server, ...) — an exact-name-only check
// missed these deep imports the first time around, which is exactly how
// react-dom kept resolving to the wrong copy even after "react" itself
// was fixed.
const singleInstanceModules = ["react", "react-dom"];
const isSingleInstanceModule = (moduleName) =>
  singleInstanceModules.some(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  );
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isSingleInstanceModule(moduleName)) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
