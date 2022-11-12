#!/usr/bin/env -S deno run --allow-write=./_site,./tmp --allow-read=/tmp,./ --allow-net --allow-run=./main.ts,lua
import { commands } from "./build.ts";

const sub = Deno.args[0];
const command = commands[sub];
if (!command) {
  console.log("subcommand required");
  Deno.exit(-1);
}
await command();
