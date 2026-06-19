import { appendFileSync, readFileSync } from "node:fs";

const [, , buildJsonPath, outputPath] = process.argv;

if (!buildJsonPath) {
	throw new Error("Usage: extract-eas-android-artifact.mjs <eas-build.json>");
}

const rawBuildJson = readFileSync(buildJsonPath, "utf8").trim();
const parsedBuilds = JSON.parse(rawBuildJson);
const builds = Array.isArray(parsedBuilds) ? parsedBuilds : [parsedBuilds];
const androidBuild =
	builds.find((build) => String(build?.platform).toLowerCase() === "android") ??
	builds[0];

const artifactUrl =
	androidBuild?.artifacts?.buildUrl ??
	androidBuild?.artifacts?.applicationArchiveUrl ??
	androidBuild?.artifactUrl;

if (!artifactUrl) {
	throw new Error("EAS build output did not include an Android artifact URL.");
}

const buildId = androidBuild?.id ?? "unknown";
if (outputPath) {
	appendFileSync(outputPath, `artifact_url=${artifactUrl}\n`);
	appendFileSync(outputPath, `build_id=${buildId}\n`);
}
