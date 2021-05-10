function patchCommander(Command) {
    Command.prototype.forwardSubcommands = function() {
        var self = this;
        var listener = function(args, unknown) {
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
        var parent = this.parent || this;
        var name = parent === this ? '*' : this._name;
        parent.on('command:' + name, listener);
        if (this._alias) parent.on('command:' + this._alias, listener);
        return this;
    };
  }
module.exports = patchCommander;