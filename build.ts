#!/usr/bin/env -S deno run --allow-write=./_site,./tmp --allow-read=/tmp,./ --allow-net --allow-run=./main.ts,lua
import { std } from "./deps.ts";
import * as templates from "./templates.ts";
import * as djot from "./djot.ts";
import { HtmlString } from "./templates.ts";

let build_id = 0;
async function watch() {
  async function rebuild() {
    try {
      console.log(`rebuild #${build_id}`);
      build_id += 1;
      await Deno.run({ cmd: ["./main.ts", "build", "--update"] }).status();
    } catch {
      // ignore
    }
  }

  await std.fs.emptyDir("./_site");
  await rebuild();

  const rebuild_debounced = std.async.debounce(
    rebuild,
    16,
  );

  outer:
  for await (const event of Deno.watchFs("./", { recursive: true })) {
    for (const path of event.paths) {
      if (path.match(/\.\/(tmp|_site)/)) {
        continue outer;
      }
    }
    if (event.kind == "access") continue outer;
    rebuild_debounced();
  }
}

class Ctx {
  constructor(
    public parse_ms: number = 0,
    public render_ms: number = 0,
    public collect_ms: number = 0,
    public total_ms: number = 0,
  ) {}
}

async function build() {
  const t = performance.now();
  const ctx = new Ctx();
  if (Deno.args.includes("--update")) {
    await Deno.mkdir("_site", { recursive: true });
  } else {
    await std.fs.emptyDir("./_site");
  }

  const posts = await collect_posts(ctx);
  await update_file("_site/index.html", templates.post_list(posts).value);
  await update_file("_site/feed.xml", templates.feed(posts).value);
  for (const post of posts) {
    await update_file(`_site${post.path}`, templates.post(post).value);
  }

  const pages = ["about", "resume", "links"];
  for (const page of pages) {
    const text = await Deno.readTextFile(`src/${page}.djot`);
    const ast = await djot.parse(text);
    const html = djot.render(ast, {});
    await update_file(`_site/${page}.html`, templates.page(page, html).value);
  }

  const paths = [
    "favicon.ico",
    "resume.pdf",
    "css/*",
    "assets/*",
  ];
  for (const path of paths) {
    await update_path(path);
  }

  ctx.total_ms = performance.now() - t;
  console.log(`${ctx.total_ms}ms`);
  if (Deno.args.includes("-p")) console.log(JSON.stringify(ctx));
}

async function update_file(path: string, content: Uint8Array | string) {
  if (!content) return;
  await std.fs.ensureFile(path);
  await std.fs.ensureDir("./tmp");
  const temp = await Deno.makeTempFile({ dir: "./tmp" });
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
    for await (const entry of Deno.readDir(`src/${dir}`)) {
      futs.push(update_path(`${dir}/${entry.name}`));
    }
    await Promise.all(futs);
  } else {
    await update_file(
      `_site/${path}`,
      await Deno.readFile(`src/${path}`),
    );
  }
}

export type Post = {
  year: number;
  month: number;
  day: number;
  slug: string;
  date: Date;
  title: HtmlString;
  path: string;
  src: string;
  content: HtmlString;
  summary: HtmlString;
};

async function collect_posts(ctx: Ctx): Promise<Post[]> {
  const start = performance.now();
  const post_walk = std.fs.walk("./src/posts", { includeDirs: false });
  const work = std.async.pooledMap(8, post_walk, async (entry) => {
    if (!entry.name.endsWith(".djot")) return undefined;
    const [, y, m, d, slug] = entry.name.match(
      /^(\d\d\d\d)-(\d\d)-(\d\d)-(.*)\.djot$/,
    )!;
    const [year, month, day] = [y, m, d].map((it) => parseInt(it, 10));
    const date = new Date(Date.UTC(year, month - 1, day));

    const text = await Deno.readTextFile(entry.path);

    let t = performance.now();
    const ast = await djot.parse(text);
    ctx.parse_ms += performance.now() - t;

    t = performance.now();
    const render_ctx = { date };
    const html = djot.render(ast, render_ctx);
    ctx.render_ms += performance.now() - t;

    const title = ast.child("section")?.child("heading")?.content ??
      new HtmlString("untitled");
    return {
      year,
      month,
      day,
      slug,
      date,
      title,
      content: html,
      // deno-lint-ignore no-explicit-any
      summary: (render_ctx as any).summary,
      path: `/${y}/${m}/${d}/${slug}.html`,
      src: `/src/posts/${y}-${m}-${d}-${slug}.djot`,
    };
  });

  const posts = [];
  for await (const it of work) if (it) posts.push(it);
  posts.sort((l, r) => l.path < r.path ? 1 : -1);
  ctx.collect_ms = performance.now() - start;
  return posts;
}

export const commands: { [key: string]: () => Promise<void> } = {
  watch,
  build,
};
