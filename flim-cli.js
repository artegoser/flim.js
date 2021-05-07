#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
program.version(require("./package.json").version);

program.parse();