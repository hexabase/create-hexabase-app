import chalk from "chalk";

export default function (appName) {
  console.log(`

We are almost there! Follow next steps to get every thing ready:

1. $ cd ${appName}

2. Configure your enviroment variables in .env file:
${chalk.yellow("hint: you can see configs in .env.example")}

3. Start your Hexabase app with:
    $ npm run dev / $ yarn dev
    ${chalk.redBright(
    `It should be based on which package installer you selected above`
    )}
 
${chalk.green("Enjoy coding!")}
`);
}
