#!/usr/bin/env node

require = require("esm")(module);
require("./createHxb.js").cli(process.argv);
