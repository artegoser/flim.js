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
            let flim = new add.flim();
    }
  });

program
  .command("init")
  .description("creates a flim.json file")
  .option("-f, --fast-mode", "Skip all options", false)
  .action((options)=>{
    let init = require("./flim.js/flim-init");
    if(options.fastMode){
      init.finit();
    } else {
      init.init();
    }
  })

program.parse(process.argv);