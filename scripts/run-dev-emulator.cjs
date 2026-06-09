const { spawn } = require("child_process");

const child = spawn("npm", ["run", "dev:emulator"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
