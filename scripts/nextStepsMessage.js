import chalk from "chalk";

export default function () {
  console.log(`
    ${chalk.bold(
      `When the installation is done, open project with your favorite IDE and ${chalk.green(
        "enjoy coding!"
      )}`
    )}
  `);
}
