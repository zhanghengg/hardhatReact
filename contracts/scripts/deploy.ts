import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

async function main() {
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  const address = await counter.getAddress();
  console.log("Counter:", address);

  // Write address to frontend
  const frontendPath = resolve(__dirname, "../../frontend/src/contracts.json");
  const dir = dirname(frontendPath);
  mkdirSync(dir, { recursive: true });
  const data = { Counter: { address } };
  writeFileSync(frontendPath, JSON.stringify(data, null, 2));
  console.log("Wrote address to", frontendPath);

  // Also write typed constants file
  const constantsTs = resolve(__dirname, "../../frontend/src/constants.ts");
  const content = `export const COUNTER_ADDRESS = "${address}" as const;\n`;
  writeFileSync(constantsTs, content);
  console.log("Wrote constants to", constantsTs);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
