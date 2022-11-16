import arg from "arg";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import os from "os";
// import { spawnSync } from "child_process";
import AdmZip from "adm-zip";
import createHxb from "./scripts/notificationMessage";
import brandMessage from "./scripts/brandMessage";
import nextSteps from "./scripts/nextStepsMessage";
import cliSelect from "cli-select";
import axios from "axios";
const spawn = require("cross-spawn");
const packageJson = require("./package.json");
const validateProjectName = require("validate-npm-package-name");

const exampleOptions = [
  {
    name: "Hexabase SDK NuxtJs",
    url: "https://github.com/b-eee/nuxt-hxb-sdk.git",
  },
  {
    name: "Hexabase SDK NextJs",
    url: "https://github.com/b-eee/next-hxb-sdk.git",
  },
  {
    name: "Hexabase SDK SvelteKit",
    url: "https://github.com/b-eee/svelte-hxb-sdk.git",
  },
  {
    name: "Hexabase SDK RemixJs",
    url: "https://github.com/b-eee/remix-hxb-sdk.git",
  },
];

const installOptions = [
  {
    name: "yarn",
    command: "yarn",
  },
  {
    name: "npm",
    command: "npm",
  },
];

function parseArguments(rawArgs) {
  const variables = {
    "--help": Boolean,
    "-h": "--help",
    "--version": Boolean,
    "-v": "--version",
  };
  const args = arg(variables, { argv: rawArgs.slice(2) });
  return {
    help: args["--help"] || false,
    version: args["--version"] || false,
    projectName: args._[0],
  };
}

export async function cli(args) {
  try {
    let options = parseArguments(args);
    if (options.help) {
      console.log(
        `if you have any question, 
        leave message in our github repo https://github.com/hexabase/hexabase-js `
      );
    } else if (options.version) {
      console.log(packageJson.version);
    } else {
      let isValid = validateProjectName(options.projectName);
      if (isValid) {
        brandMessage();
        const destination =
          options.projectName === "."
            ? path.join(process.cwd(), "hexabase-app")
            : path.join(process.cwd(), options.projectName);
        console.log(
          `app name: ${chalk.yellow(
            (options.projectName !== "." && options.projectName) ||
              "hexabase-app"
          )}`
        );
        fs.mkdirSync(destination);
        console.log(
          `Creating a new Hexabase sdk app in ${chalk.cyan(destination)}...`
        );
        console.log(`Which application you want to get?`);
        try {
          cliSelect({
            values: exampleOptions,
            valueRenderer: (value, selected) => {
              if (selected) {
                return chalk.underline.green(value.name);
              }
              return value.name;
            },
          }).then((selected) => {
            console.log(chalk.yellow(`${selected.value.name} selected`));

            let gitUrl = selected.value.url;
            gitUrl = String(gitUrl).replace(".git", "/zipball/master");
            axios.get(gitUrl, { responseType: "arraybuffer" }).then((res) => {
              const zip = new AdmZip(res.data);
              const files = zip.getEntries();
              files.forEach((file) => {
                //Only copy files as we are handling the folders
                if (!file.entryName.endsWith("/")) {
                  let newDestination = destination;
                  //Remove the root directory
                  let entryPath = file.entryName.substring(
                    file.entryName.indexOf("/") + 1,
                    file.entryName.length
                  );

                  //Get the new path for subdirectories
                  if (
                    entryPath.includes("/") &&
                    entryPath.lastIndexOf("/") !== entryPath.length - 1
                  ) {
                    //Just add the path to the file, not the file itself
                    newDestination = path.join(
                      newDestination,
                      entryPath.substring(0, entryPath.lastIndexOf("/"))
                    );
                  }

                  zip.extractEntryTo(file, newDestination, false, true);
                }
              });
              console.log("Which one you want to use to install packages?");
              cliSelect({
                values: installOptions,
                valueRenderer: (value, selected) => {
                  if (selected) {
                    return chalk.underline.green(value.name);
                  }
                  return value.name;
                },
              }).then((selected) => {
                console.log(
                  chalk.yellow(
                    `Installing packages with ${selected.value.name} ...`
                  )
                );

                const npmCmd = selected.value.command;
                npmCmd === "npm"
                  ? spawn("npm", ["install", "--save", "--save-exact"], {
                      env: process.env,
                      cwd: destination,
                      stdio: "inherit",
                    })
                  : spawn("yarn", ["--exact"], {
                      env: process.env,
                      cwd: destination,
                      stdio: "inherit",
                    });
                nextSteps();
              });
            });
          });
        } catch (e) {
          createHxb.error(e);
        }
      }
    }
  } catch (e) {
    createHxb.error(e);
    process.exit(1);
  }
}
