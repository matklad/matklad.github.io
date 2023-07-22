import { build, watch } from "./build.ts";

const sub = Deno.args[0];
if (sub === "build") {
  const params = {
    update: false,
    spell: false,
    profile: true,
  };
  for (const arg of Deno.args.slice(1)) {
    if (arg == "--update") params.update = true;
    if (arg == "--spell") params.spell = true;
    if (arg == "--profile") params.profile = true;
  }
  await build(params);
} else if (sub === "watch") {
  await watch();
} else {
  console.error("subcommand required");
  Deno.exit(-1);
}
