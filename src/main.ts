import * as async from "std/async/mod.ts";
import * as fs from "std/fs/mod.ts";
import * as templates from "./templates.ts";
import * as djot from "./djot.ts";
import { HtmlString } from "./templates.ts";

async function main() {
  const params = {
    update: false,
    spell: false,
    profile: false,
    filter: "",
  };

  const subcommand = Deno.args[0];

  let i = 1;
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
}

function fatal(message: string) {
  console.error(message);
  Deno.exit(1);
}

async function watch(params: { filter: string }) {
  let signal = async.deferred();
  (async () => {
    let build_id = 0;
    while (await signal) {
      signal = async.deferred();
      console.log(`rebuild #${build_id}`);
      build_id += 1;
      await build({
        update: true,
        spell: false,
        profile: false,
        filter: params.filter,
      });
    }
  })();

  signal.resolve(true);

  const rebuild_debounced = async.debounce(
    () => signal.resolve(true),
    16,
  );

  for await (const event of Deno.watchFs("./content", { recursive: true })) {
    if (event.kind == "access") continue;
    await rebuild_debounced();
  }
  signal.resolve(false);
}

class Ctx {
  constructor(
    public read_ms: number = 0,
    public parse_ms: number = 0,
    public render_ms: number = 0,
    public collect_ms: number = 0,
    public total_ms: number = 0,
  ) {}
}

async function build(params: {
  update: boolean;
  spell: boolean;
  profile: boolean;
  filter: string;
}) {
  const t = performance.now();

  const ctx = new Ctx();
  if (params.update) {
    await Deno.mkdir("./out/res", { recursive: true });
  } else {
    await fs.emptyDir("./out/res");
  }

  const posts = await collect_posts(ctx, params.filter);
  await update_file("out/res/index.html", templates.post_list(posts).value);
  await update_file("out/res/feed.xml", templates.feed(posts).value);
  for (const post of posts) {
    await update_file(
      `out/res${post.path}`,
      templates.post(post, params.spell).value,
    );
  }

  const pages = ["about", "resume", "links", "style"];
  for (const page of pages) {
    const text = await Deno.readTextFile(`content/${page}.dj`);
    const ast = await djot.parse(text);
    const html = djot.render(ast, {});
    await update_file(`out/res/${page}.html`, templates.page(page, html).value);
  }

  const paths = [
    "favicon.svg",
    "favicon.png",
    "resume.pdf",
    "css/*",
    "assets/*",
    "assets/resilient-parsing/*",
  ];
  for (const path of paths) {
    await update_path(path);
  }

  ctx.total_ms = performance.now() - t;
  console.log(`${ctx.total_ms}ms`);
  if (params.profile) console.log(JSON.stringify(ctx));
}

async function update_file(path: string, content: Uint8Array | string) {
  if (!content) return;
  await fs.ensureFile(path);
  await fs.ensureDir("./build");
  const temp = await Deno.makeTempFile({ dir: "./build" });
  if (content instanceof Uint8Array) {
    await Deno.writeFile(temp, content);
  } else {
    await Deno.writeTextFile(temp, content);
  }
  await Deno.rename(temp, path);
}

async function update_path(path: string) {
  if (path.endsWith("*")) {
    const dir = path.replace("*", "");
    const futs = [];
    for await (const entry of Deno.readDir(`content/${dir}`)) {
      if (entry.isFile) {
        futs.push(update_path(`${dir}/${entry.name}`));
      }
    }
    await Promise.all(futs);
  } else {
    await update_file(
      `out/res/${path}`,
      await Deno.readFile(`content/${path}`),
    );
  }
}

export type Post = {
  year: number;
  month: number;
  day: number;
  slug: string;
  date: Date;
  title: string;
  path: string;
  src: string;
  content: HtmlString;
  summary: string;
};

async function collect_posts(ctx: Ctx, filter: string): Promise<Post[]> {
  const start = performance.now();
  const posts = [];
  for await (
    const entry of fs.walk("./content/posts", { includeDirs: false })
  ) {
    if (!entry.name.endsWith(".dj")) continue;
    if (filter !== "") {
      if (entry.name.indexOf(filter) === -1) continue;
    }
    const [, y, m, d, slug] = entry.name.match(
      /^(\d\d\d\d)-(\d\d)-(\d\d)-(.*)\.dj$/,
    )!;
    const [year, month, day] = [y, m, d].map((it) => parseInt(it, 10));
    const date = new Date(Date.UTC(year, month - 1, day));

    let t = performance.now();
    const text = await Deno.readTextFile(entry.path);
    ctx.read_ms += performance.now() - t;

    t = performance.now();
    const ast = djot.parse(text);
    ctx.parse_ms += performance.now() - t;

    t = performance.now();
    const render_ctx = { date, summary: undefined, title: undefined };
    const html = djot.render(ast, render_ctx);
    ctx.render_ms += performance.now() - t;

    posts.push({
      year,
      month,
      day,
      slug,
      date,
      title: render_ctx.title!,
      content: html,
      summary: render_ctx.summary!,
      path: `/${y}/${m}/${d}/${slug}.html`,
      src: `/content/posts/${y}-${m}-${d}-${slug}.dj`,
    });
  }
  posts.sort((l, r) => l.path < r.path ? 1 : -1);
  ctx.collect_ms = performance.now() - start;
  return posts;
}

if (import.meta.main) await main();
