import { build, watch } from "./build.ts";

const params = {
  update: false,
  spell: false,
  profile: false,
  filter: "",
};

const subcommand = Deno.args[0];

var i = 1;
for (; i < Deno.args.length; i++) {
  switch (Deno.args[i]) {
    case "--update": {
      params.update = true;
      break;
    }
    case "--spell": {
      params.spell = true;
      break;
    }
    case "--profile": {
      params.profile = true;
      break;
    }
    case "--filter": {
      params.filter = Deno.args[i + 1] ?? "";
      i++;
      break;
    }
    default:
      fatal(`unexpected argument: ${Deno.args[i]}`);
  }
}

if (subcommand === "build") {
  await build(params);
} else if (subcommand === "watch") {
  await watch(params);
} else {
  fatal("subcommand required");
}

function fatal(message: string) {
  console.error(message);
  Deno.exit(1);
}
