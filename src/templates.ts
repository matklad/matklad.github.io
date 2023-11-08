// deno-lint-ignore-file no-explicit-any
import { Post } from "./main.ts";

const site_url = "https://matklad.github.io";

export const base = (
  { content, src, title, path, description, extra_css }: {
    content: HtmlString;
    src: string;
    title: string;
    description: string;
    path: string;
    extra_css?: string;
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
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="canonical" href="${site_url}${path}">
  <link rel="alternate" type="application/rss+xml" title="matklad" href="${site_url}/feed.xml">
  <style>
  @font-face {
    font-family: 'Open Sans'; src: url('/css/OpenSans-300-Normal.woff2') format('woff2');
    font-weight: 300; font-style: normal;
  }
  @font-face {
    font-family: 'JetBrains Mono'; src: url('/css/JetBrainsMono-400-Normal.woff2') format('woff2');
    font-weight: 400; font-style: normal;
  }
  @font-face {
    font-family: 'JetBrains Mono'; src: url('/css/JetBrainsMono-700-Normal.woff2') format('woff2');
    font-weight: 700; font-style: normal;
  }
  @font-face {
    font-family: 'EB Garamond'; src: url('/css/EBGaramond-400-Normal.woff2') format('woff2');
    font-weight: 400; font-style: normal;
  }
  @font-face {
    font-family: 'EB Garamond'; src: url('/css/EBGaramond-400-Italic.woff2') format('woff2');
    font-weight: 400; font-style: italic;
  }
  @font-face {
    font-family: 'EB Garamond'; src: url('/css/EBGaramond-700-Normal.woff2') format('woff2');
    font-weight: 700; font-style: normal;
  }
  @font-face {
    font-family: 'EB Garamond'; src: url('/css/EBGaramond-700-Italic.woff2') format('woff2');
    font-weight: 700; font-style: italic;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; margin-block-start: 0; margin-block-end: 0; }

  body {
    max-width: 80ch;
    padding: 2ch;
    margin-left: auto;
    margin-right: auto;
  }

  header { margin-bottom: 2rem; }
  header > nav { display: flex; column-gap: 2ch; align-items: baseline; flex-wrap: wrap; }
  header a { font-style: normal; color: rgba(0, 0, 0, .8); text-decoration: none; }
  header a:hover { color: rgba(0, 0, 0, .8); text-decoration: underline; }
  header .title { font-size: 1.25em; flex-grow: 2; }

  footer { margin-top: 2rem; }
  footer > p { display: flex; column-gap: 2ch; justify-content: center; flex-wrap: wrap; }
  footer a { color: rgba(0, 0, 0, .8); text-decoration: none; white-space: nowrap; }
  footer i { vertical-align: middle; color: rgba(0, 0, 0, .8) }

  </style>

  <link rel="stylesheet" href="/css/main.css">
  ${extra_css ? html`<link rel="stylesheet" href="/css/${extra_css}">` : ""}
</head>

<body>
  <header>
    <nav>
      <a class="title" href="/">matklad</a>
      <a href="/about.html">About</a>
      <a href="/resume.html">Resume</a>
      <a href="/links.html">Links</a>
    </nav>
  </header>

  <main>
  ${content}
  </main>

  <footer class="site-footer">
    <p>
      <a href="https://github.com/matklad/matklad.github.io/edit/master${src}">
        <svg class="icon"><use href="/assets/icons.svg#edit"/></svg>
        Fix typo
      </a>
      <a href="/feed.xml">
        <svg class="icon"><use href="/assets/icons.svg#rss"/></svg>
        Subscribe
      </a>
      <a href="mailto:aleksey.kladov+blog@gmail.com">
        <svg class="icon"><use href="/assets/icons.svg#email"/></svg>
        Get in touch
      </a>
      <a href="https://github.com/matklad">
        <svg class="icon"><use href="/assets/icons.svg#github"/></svg>
        matklad
      </a>
    </p>
  </footer>
</body>

</html>
`;

const blurb = "Yet another programming blog by Alex Kladov aka matklad.";

export function page(name: string, content: HtmlString) {
  return base({
    path: `/${name}`,
    title: "matklad",
    description: blurb,
    src: `/content/${name}.dj`,
    extra_css: name === "resume" ? "resume.css" : undefined,
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
    src: "/src/templates.ts",
    content: html`<ul class="post-list">${list_items}</ul>`,
  });
};

export function post(post: Post, spellcheck: boolean): HtmlString {
  return base({
    src: post.src,
    title: post.title,
    description: post.summary,
    path: post.path,
    content: html`<article ${
      spellcheck ? 'contentEditable="true"' : ""
    }>\n${post.content}</article>`,
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
<title type="text">${post.title}</title>
<link href="${site_url}${post.path}" rel="alternate" type="text/html" title="${post.title}" />
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
  return `${data}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
