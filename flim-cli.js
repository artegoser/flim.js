#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
program.version(require("./package.json").version);

program
  .command('add <pkg...>')
  .description('adds packages by package-manager')
  .option('-pm, --package-manager <mode>', 'Which package manager to use', 'flim')
  .option('-g, --global', 'Works with npm', false)
  .action((pkg, options) => {
    let add = require("./flim.js/flim-add");
    if(!pkg) throw new Error("package not specified");
    switch(options.packageManager){
        case "npm":
            add.npm(pkg, options.global);
            break;
        case "yarn":
            add.yarn(pkg);
            break;
        case "flim":
            throw new Error("we work on flim pm");
    }
  });


program.parse(process.argv);