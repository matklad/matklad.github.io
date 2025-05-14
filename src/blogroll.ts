// deno-lint-ignore-file
import { parseFeed } from "@rss";

export async function blogroll(): Promise<FeedEntry[]> {
  const urls = (await Deno.readTextFile("content/blogroll.txt"))
    .split("\n").filter((line) => line.trim().length > 0);
  const all_entries = (await Promise.all(urls.map(blogroll_feed))).flat();
  all_entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return all_entries;
}

export interface FeedEntry {
  title: string;
  url: string;
  date: Date;
}

async function blogroll_feed(url: string): Promise<FeedEntry[]> {
  let feed;
  try {
    const response = await fetch(url);
    const xml = await response.text();
    feed = await parseFeed(xml);
  } catch (error) {
    console.error({ url, error });
    return [];
  }

  return feed.entries.map((entry) => {
    return {
      title: entry.title!.value!,
      url: (entry.links.find((it) => {
        it.type == "text/html" || it.href!.endsWith(".html");
      }) ?? entry.links[0])!.href!,
      date: (entry.published ?? entry.updated)!,
    };
  }).slice(0, 3);
}
