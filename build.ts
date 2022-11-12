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

async function build() {
  const start = performance.now();

  if (Deno.args.includes("--update")) {
    await Deno.mkdir("_site", { recursive: true });
  } else {
    await std.fs.emptyDir("./_site");
  }

  const posts = await collect_posts();

  await update_file("_site/index.html", templates.post_list(posts).value);
  await update_file("_site/feed.xml", templates.feed(posts).value);
  await update_file("_site/about.html", templates.about().value);
  for (const post of posts) {
    await update_file(`_site${post.path}`, templates.post(post).value);
  }

  const paths = [
    "favicon.ico",
    "css/*",
    "assets/*",
  ];
  for (const path of paths) {
    await update_path(path);
  }

  const end = performance.now();
  console.log(`${end - start}ms`);
}

async function update_file(path: string, contents: Uint8Array | string) {
  if (!contents) return;
  await std.fs.ensureFile(path);
  await std.fs.ensureDir("./tmp");
  const temp = await Deno.makeTempFile({ dir: "./tmp" });
  if (contents instanceof Uint8Array) {
    await Deno.writeFile(temp, contents);
  } else {
    await Deno.writeTextFile(temp, contents);
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

async function collect_posts(): Promise<Post[]> {
  const post_walk = std.fs.walk("./src/posts", { includeDirs: false });
  const work = std.async.pooledMap(8, post_walk, async (entry) => {
    if (!entry.name.endsWith(".djot")) return undefined;
    const [, y, m, d, slug] = entry.name.match(
      /^(\d\d\d\d)-(\d\d)-(\d\d)-(.*)\.djot$/,
    )!;
    const [year, month, day] = [y, m, d].map((it) => parseInt(it, 10));
    const date = new Date(Date.UTC(year, month - 1, day));

    const text = await Deno.readTextFile(entry.path);
    const ast = await djot.parse(text);
    const ctx = { date };
    const html = djot.render(ast, ctx);

    const title = ast.child("heading")?.content ?? new HtmlString("untitled");
    return {
      year,
      month,
      day,
      slug,
      date,
      title,
      content: html,
      // deno-lint-ignore no-explicit-any
      summary: (ctx as any).summary,
      path: `/${y}/${m}/${d}/${slug}.html`,
      src: `/src/posts/${y}-${m}-${d}-${slug}.djot`,
    };
  });

  const posts = [];
  for await (const it of work) if (it) posts.push(it);
  posts.sort((l, r) => l.path < r.path ? 1 : -1);
  return posts;
}

export const commands: { [key: string]: () => Promise<void> } = {
  watch,
  build,
};
