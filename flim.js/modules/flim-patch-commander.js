function patchCommander(Command) {
    Command.prototype.forwardSubcommands = function() {
        let self = this;
        let listener = function(args, unknown) {
            args = args || [];
            unknown = unknown || [];
            var parsed = self.parseOptions(unknown);
            if (parsed.args.length) args = parsed.args.concat(args);
            unknown = parsed.unknown;
            if (unknown.includes('--help') || unknown.includes('-h')) {
                self.outputHelp();
                process.exit(0);
            }
            self.parseArgs(args, unknown);
        };
        if (this._args.length > 0) {
            console.error('forwardSubcommands cannot be applied to command with explicit args');
        }
        let parent = this.parent || this;
        let name = parent === this ? '*' : this._name;
        parent.on('command:' + name, listener);
        if (this._alias) parent.on('command:' + this._alias, listener);
        return this;
    };
  }
module.exports = patchCommander;