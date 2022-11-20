// deno-lint-ignore-file no-explicit-any
import { Post } from "./build.ts";

const site_url = "https://matklad.github.io";

export const base = (
  { content, src, title, path, description }: {
    content: HtmlString;
    src: string;
    title: string;
    description: string;
    path: string;
  },
): HtmlString =>
  html`
<!DOCTYPE html>
<html lang='en-US'>

<head>
  <meta charset='utf-8'>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${site_url}${path}">
  <link rel="alternate" type="application/rss+xml" title="matklad" href="${site_url}/feed.xml">
  <style>
  @font-face {
    font-family: 'JetBrains Mono';
    src: url('/css/JetBrainsMono-Regular.woff2') format('woff2');
  }

  @font-face {
    font-family: 'JetBrains Mono';
    src: url('/css/JetBrainsMono-Bold.woff2') format('woff2');
    font-weight: bold;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; margin-block-start: 0; margin-block-end: 0; }

  h1, h2, h3 { font-weight: 300; }

  body { display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
  main { display: flex; flex-direction: column; width: 100%; max-width: 80ch; padding-left: 2ch; padding-right: 2ch; }

  header { width: 100%; max-width: 80ch; margin-bottom: 1.5rem; }
  header > nav { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; }
  header a { font-style: normal; margin-left: 1ch; margin-right: 1ch; line-height: 1.5rem; color: rgba(0, 0, 0, .8); text-decoration: none; }
  header a:hover { color: rgba(0, 0, 0, .8); text-decoration: underline; }
  header .title { font-size: 1.25em; flex-grow: 2; }

  footer { display: flex; justify-content: center; align-items: baseline; width: 100%; max-width: 80ch; margin-top: 1rem; height: 2rem; padding-left: 1ch; padding-right: 1ch; }
  footer > p { margin-bottom: 0; }
  footer a { padding-left: 2ch; font-style: normal; color: rgba(0, 0, 0, .8); text-decoration: none; white-space: nowrap; }
  footer i { vertical-align: middle; color: rgba(0, 0, 0, .8) }

  </style>

  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=EB+Garamond:400,400italic,700,700italic%7COpen+Sans:300">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css">
</head>

<body>
  <header>
    <nav>
      <a class="title" href="/">matklad</a>
      <a href="/about.html">About</a>
      <a href="/resume.html">Resume</a>
    </nav>
  </header>

  <main>
  ${content}
  </main>

  <footer class="site-footer">
    <p>
      <a href="https://github.com/matklad/matklad.github.io/edit/master${src}">
        <i class="fa fa-edit"></i> fix typo
      </a>

      <a href="/feed.xml">
        <i class="fa fa-rss"></i> rss
      </a>

      <a href="https://github.com/matklad">
        <i class="fa fa-github"></i> matklad
      </a>
    </p>
  </footer>
</body>

</html>
`;

const blurb = "Yet another programming blog by Alex Kladov aka matklad.";

export const about = () =>
  base({
    path: "/about",
    title: "matklad",
    description: blurb,
    src: "templates.ts",
    content: html`
<h2>Hello!</h2>
<p>
  <img class="about-ava" src="https://avatars.githubusercontent.com/u/1711539?v=4" alt="matklad" width="128">
  I am Alex Kladov, a programmer who loves simple code and programming languages.
  You can find me on <a href="https://github.com/matklad">GitHub</a>.
  If you want to contact me, please write an e-mail (address is on the GitHub profile).
</p>
<p>Code samples on this blog are dual licensed under MIT OR Apache-2.0.</p>
`,
  });

export function resume(content: HtmlString): HtmlString {
  return base({
    path: "/resume",
    title: "matklad",
    description: blurb,
    src: "src/resume.djot",
    content,
  });
}

export const post_list = (posts: Post[]): HtmlString => {
  const list_items = posts.map((post) =>
    html`
<li>
  <h2>${time(post.date)} <a href="${post.path}">${post.title}</a></h2>
</li>`
  );

  return base({
    path: "",
    title: "matklad",
    description: blurb,
    src: "templates.ts",
    content: html`<ul class="post-list">${list_items}</ul>`,
  });
};

export function post(post: Post): HtmlString {
  return base({
    src: post.src,
    title: post.title.value,
    description: post.summary.value,
    path: post.path,
    content: html`<article>\n${post.content}</article>`,
  });
}

export function time(date: Date): HtmlString {
  const human = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const machine = yyyy_mm_dd(date);
  return html`<time datetime="${machine}">${human}</time>`;
}

function yyyy_mm_dd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const feed = (posts: Post[]): HtmlString => {
  const entries = posts.slice(0, 10).map(feed_entry);

  return html`<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<link href="${site_url}/feed.xml" rel="self" type="application/atom+xml"/>
<link href="${site_url}" rel="alternate" type="text/html"/>
<updated>${new Date().toISOString()}</updated>
<id>${site_url}/feed.xml</id>
<title type="html">matklad</title>
<subtitle>Yet another programming blog by Alex Kladov aka matklad.</subtitle>
<author><name>Alex Kladov</name></author>
${entries}
</feed>
`;
};

export const feed_entry = (post: Post): HtmlString => {
  return html`
<entry>
<title type="html">${post.title}</title>
<link href="${site_url}${post.path}" rel="alternate" type="text/html" title="Self Modifying Code" />
<published>${yyyy_mm_dd(post.date)}T00:00:00+00:00</published>
<updated>${yyyy_mm_dd(post.date)}T00:00:00+00:00</updated>
<id>${site_url}${post.path.replace(".html", "")}</id>
<author><name>Alex Kladov</name></author>
<summary type="html"><![CDATA[${post.summary}]]></summary>
<content type="html" xml:base="${site_url}${post.path}"><![CDATA[${post.content}]]></content>
</entry>
`;
};

export function html(
  strings: ArrayLike<string>,
  ...values: any[]
): HtmlString {
  function content(value: any): string[] {
    if (value === undefined) return [];
    if (value instanceof HtmlString) return [value.value];
    if (Array.isArray(value)) return value.flatMap(content);
    return [escapeHtml(value)];
  }
  return new HtmlString(
    String.raw({ raw: strings }, ...values.map((it) => content(it).join(""))),
  );
}

export class HtmlString {
  constructor(public value: string) {
  }
  push(other: HtmlString) {
    this.value = `${this.value}\n${other.value}`;
  }
}

function escapeHtml(data: any): string {
  const s = `${data}`;
  return s.replace(/[<>&]/g, (match) => {
    if (match === "<") return "&lt;";
    if (match === ">") return "&gt;";
    if (match === "&") return "&amp;";
    throw "unreachable";
  });
}
