#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
program.version(require("./package.json").version);

program
  .command('add <pkg...>')
  .description('adds packages by package-manager')
  .option('-pm, --package-manager <mode>', 'Which package manager to use', 'flim')
  .option('-g, --global', 'Don\'t works with yarn', false)
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
            let flim = new add.flim(pkg, options.global);
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
  });

program
  .command("ldb <dbname> create")
  .description("creates a localdb")
  .option("-f, --fast-mode", "Skipp all options", false)
  .action((dbname, options)=>{
    let ldb = require("./flim.js/flim-ldb");
    ldb = new ldb(dbname);
    if(options.fastMode) ldb.fcreate();
    else ldb.create();
  });

program
  .command("ldb add <dbname> <title> <name> <url>")
  .description("add a package to localdb")
  .option("-s, --sequential-mode", "Fill in the package description sequentially")
  .action((dbname, title, name, url)=>{
    let ldb = require("./flim.js/flim-ldb");
    ldb = new ldb(dbname);
    if(sequentialMode) ldb.sadd(title, name, url)
    else ldb.add(title, name, url)
  });

program.parse(process.argv);