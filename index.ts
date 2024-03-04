import fs from "fs";

interface ABIEntry {
  name: string;
  type: string;
  inputs?: Array<{ type: string; name: string }>;
  outputs?: Array<{ type: string; name: string }>;
}

// Function to read and parse an ABI file into ABIEntry[]
const parseABIFile = (filePath: string): ABIEntry[] => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const abi: ABIEntry[] = JSON.parse(fileContent);
  return abi;
};

// Function to identify common functions
const findCommonFunctions = (...abis: ABIEntry[][]): ABIEntry[] => {
  const common = abis.reduce((acc, abi) => {
    abi.forEach((entry) => {
      const signature = `${entry.name}(${entry.inputs
        ?.map((input) => input.type)
        .join(",")})`;
      if (
        abis.every((abi) =>
          abi.some(
            (e) =>
              `${e.name}(${e.inputs?.map((input) => input.type).join(",")})` ===
              signature
          )
        )
      ) {
        if (
          !acc.some(
            (e) =>
              `${e.name}(${e.inputs?.map((input) => input.type).join(",")})` ===
              signature
          )
        ) {
          acc.push(entry); // Include if not already added
        }
      }
    });
    return acc;
  }, [] as ABIEntry[]);
  return common;
};

// Main function to handle CLI input and output
const main = () => {
  // Skipping the first two arguments ('node' and the script path)
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: node script.js <outputFile> <abiFile1> <abiFile2> [<abiFile3> <abiFile4> ...]"
    );
    process.exit(1);
  }

  const [outputFilePath, ...abiFilePaths] = args;

  try {
    const abis: ABIEntry[][] = abiFilePaths.map(parseABIFile);
    const abstractABI = findCommonFunctions(...abis);

    // Write the abstractFactoryABI to the specified output file
    fs.writeFileSync(outputFilePath, JSON.stringify(abstractABI, null, 2));
    console.log(`AbstractFactory ABI written to ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing ABI files:", error);
  }
};

main();
