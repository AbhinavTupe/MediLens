const { spawn } = require("child_process");

function readOption(name, fallback) {
  const optionIndex = process.argv.indexOf(`--${name}`);
  if (optionIndex !== -1 && process.argv[optionIndex + 1]) {
    return process.argv[optionIndex + 1];
  }

  return fallback;
}

function main() {
  const port = Number(readOption("port", process.env.PORT || "3000"));
  const hostname = readOption("hostname", process.env.HOSTNAME || "127.0.0.1");
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(command, ["next", "dev", "--hostname", hostname, "--port", String(port)], {
    stdio: "inherit",
    shell: false,
    cwd: process.cwd(),
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main();
