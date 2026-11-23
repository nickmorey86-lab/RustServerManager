const esbuild = require("esbuild");

async function build() {
  const ctx = await esbuild.context({
    entryPoints: {
      electron: "electron.ts",
      preload: "preload.ts"
    },
    bundle: true,
    write: true,
    platform: "node",
    format: "cjs",
    outdir: "dist-electron",
    outExtension: { ".js": ".cjs" },
    sourcemap: false,
    external: ["electron"],
    loader: {
      ".png": "file",
      ".jpg": "file",
      ".jpeg": "file",
      ".svg": "file",
      ".json": "json"
    }
  });

  await ctx.rebuild();

  if (process.argv.includes("--watch")) {
    console.log("esbuild watching for changes...");
    await ctx.watch();
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
