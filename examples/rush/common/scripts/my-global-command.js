// This script provides the implementation for the example custom command "my-global-command"
// defined in common/config/rush/command-line.json.

console.log('Invoking ' + __filename);

// The first two args will be node.exe and the script itself
let args = process.argv.slice(2);

console.log('\nScript args are: ' + JSON.stringify(args));
