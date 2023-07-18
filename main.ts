import { commands } from "./build.ts";

// TODO: proper cli parsing here.
// std/flags?
const sub = Deno.args[0];
const command = commands[sub];
if (!command) {
  console.log("subcommand required");
  Deno.exit(-1);
}
await command();
