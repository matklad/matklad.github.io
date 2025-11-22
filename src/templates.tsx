/** @jsx h */
/** @jsxFrag Fragment */
// deno-lint-ignore-file no-explicit-any
import { escapeHtml, h, Raw, render, VNode } from "./tsx.ts";
import { Post as PostData } from "./main.ts";
import { FeedEntry as FeedEntryData } from "./blogroll.ts";

const site_url = "https://matklad.github.io";
const blurb = "matklad's Arts&Crafts";

export function html_ugly(node: VNode, doctype = "<!DOCTYPE html>"): string {
  return `${doctype}\n${render(node)}`;
}

function Fonts() {
  const style = `
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
`;
  return (
    <style>
      <Raw unsafe={style} />
    </style>
  );
}

function Base({ children, src, title, path, description, extra_css }: {
  children?: VNode[];
  src: string;
  title: string;
  description: string;
  path: string;
  extra_css?: string;
}) {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="canonical" href={`${site_url}${path}`} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="matklad"
          href={`${site_url}/feed.xml`}
        />
        <Fonts />
        <link rel="stylesheet" href="/css/main.css" />
        {extra_css && <link rel="stylesheet" href={`/css/${extra_css}`} />}
      </head>
      <body>
        <header>
          <nav>
            <a class="title" href="/">matklad</a>
            <a href="/about.html">About</a>
            <a href="/links.html">Links</a>
            <a href="/blogroll.html">Blogroll</a>
          </nav>
        </header>

        <main>
          {children}
        </main>

        <footer>
          <p>
            <a
              href={`https://github.com/matklad/matklad.github.io/edit/master${src}`}
            >
              <FooterIcon name="edit" />
              Fix typo
            </a>

            <a href="/feed.xml">
              <FooterIcon name="rss" />
              Subscribe
            </a>

            <a href="mailto:aleksey.kladov+blog@gmail.com">
              <FooterIcon name="email" />
              Get in touch
            </a>

            <a href="https://github.com/matklad">
              <FooterIcon name="github" />
              matklad
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

function FooterIcon({ name }: { name: string }) {
  return (
    <svg>
      <use href={`/assets/icons.svg#${name}`} />
    </svg>
  );
}

export function Page(name: string, content: HtmlString) {
  return (
    <Base
      path={`/${name}`}
      title="matklad"
      description={blurb}
      src={`/content/${name}.dj`}
      extra_css={name === "resume" ? "resume.css" : undefined}
    >
      <Raw unsafe={content.value} />
    </Base>
  );
}

export function PostList({ posts }: { posts: PostData[] }) {
  const list_items = posts.map((post) => (
    <li>
      <Time className="meta" date={post.date} />
      <h2>
        <a href={post.path}>{post.title}</a>
      </h2>
    </li>
  ));

  return (
    <Base path="" title="matklad" description={blurb} src="/src/templates.tsx">
      <ul class="post-list">
        {list_items}
      </ul>
    </Base>
  );
}

export function Post({ post }: { post: PostData }) {
  return (
    <Base
      src={post.src}
      title={post.title}
      description={post.summary}
      path={post.path}
    >
      <article>
        <Raw unsafe={post.content.value} />
      </article>
    </Base>
  );
}

export function BlogRoll({ posts }: { posts: FeedEntryData[] }) {
  function domain(url: string): string {
    return new URL(url).host;
  }

  const list_items = posts.map((post) => (
    <li>
      <span class="meta">
        <Time date={post.date} />, {domain(post.url)}
      </span>
      <h2>
        <a href={post.url}>{post.title}</a>
      </h2>
    </li>
  ));

  return (
    <Base path="" title="matklad" description={blurb} src="/src/templates.tsx">
      <ul class="post-list">
        {list_items}
      </ul>
    </Base>
  );
}

function Time(
  { date, className = undefined }: { date: Date; className?: string },
) {
  const human = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const machine = yyyy_mm_dd(date);
  return <time class={className} datetime={machine}>{human}</time>;
}
function yyyy_mm_dd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function time_html(date: Date, className: string) {
  return render(<Time date={date} className={className} />);
}

export function Redirect({ path }: { path: string }) {
  return (
    <html lang="en-US">
      <meta charset="utf-8" />
      <title>Redirecting…</title>
      <link rel="canonical" href={path} />
      <script>
        <Raw unsafe={`location="${path}"`} />
      </script>
      <meta http-equiv="refresh" content={`0; url=${path}`} />
      <meta name="robots" content="noindex" />
      <h1>Redirecting…</h1>
      <a href={path}>Click here if you are not redirected.</a>
    </html>
  );
}

export function feed_xml(posts: PostData[]): string {
  return html_ugly(
    Feed({ posts }),
    `<?xml version="1.0" encoding="utf-8"?>`,
  );
}

function Feed({ posts }: { posts: PostData[] }) {
  const entries = posts.slice(0, 10).map((post) => FeedEntry({ post }));

  return (
    <feed xmlns="http://www.w3.org/2005/Atom">
      <link
        href={`${site_url}/feed.xml`}
        rel="self"
        type="application/atom+xml"
      />
      <link href={site_url} rel="alternate" type="text/html" />
      <updated>{new Date().toISOString()}</updated>
      <id>{`${site_url}/feed.xml`}</id>
      <title type="html">matklad</title>
      <subtitle>{blurb}</subtitle>
      <author>
        <name>Alex Kladov</name>
      </author>
      {entries}
    </feed>
  );
}

function FeedEntry({ post }: { post: PostData }) {
  return (
    <entry>
      <title type="text">{post.title}</title>
      <link
        href={`${site_url}${post.path}`}
        rel="alternate"
        type="text/html"
        title={post.title}
      />
      <published>{yyyy_mm_dd(post.date)}T00:00:00+00:00</published>
      <updated>{yyyy_mm_dd(post.date)}T00:00:00+00:00</updated>
      <id>{`${site_url}${post.path.replace(".html", "")}`}</id>
      <author>
        <name>Alex Kladov</name>
      </author>
      <summary type="html">
        <Raw unsafe={`<![CDATA[${post.summary}]]>`} />
      </summary>
      <content type="html" xml:base={`${site_url}${post.path}`}>
        <Raw unsafe={`<![CDATA[${post.content.value}]]>`} />
      </content>
    </entry>
  );
}

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
