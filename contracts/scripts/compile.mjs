import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = path.resolve(import.meta.dirname, "..");
const sourceDirectory = path.join(root, "src");
const artifactDirectory = path.join(root, "artifacts");
const sources = Object.fromEntries(
  fs
    .readdirSync(sourceDirectory)
    .filter((file) => file.endsWith(".sol"))
    .map((file) => [file, { content: fs.readFileSync(path.join(sourceDirectory, file), "utf8") }]),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((entry) => entry.severity === "error");
if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join("\n"));

fs.mkdirSync(artifactDirectory, { recursive: true });
let compiled = 0;
for (const contracts of Object.values(output.contracts ?? {})) {
  for (const [name, artifact] of Object.entries(contracts)) {
    if (!artifact.evm.bytecode.object) continue;
    fs.writeFileSync(
      path.join(artifactDirectory, `${name}.json`),
      JSON.stringify({ abi: artifact.abi, bytecode: `0x${artifact.evm.bytecode.object}` }, null, 2),
    );
    compiled += 1;
  }
}
console.log(`Compiled ${compiled} contract(s) into ${artifactDirectory}`);
