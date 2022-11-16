const chalk = require("chalk");

function errorMessage(message) {
  message = chalk.bgRed.white.bold(message ? `ERROR: ${message}` : "");
  console.log(chalk.red.bold(message));
}

function successMessage(message) {
  message = chalk.bgGreen.white.bold(message ? `SUCCESS: ${message}` : "");
  console.log(chalk.green.bold(message));
}

export default {
  success: successMessage,
  error: errorMessage,
};
