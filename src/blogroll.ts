// deno-lint-ignore-file no-explicit-any
import { parseFeed } from "@rss";

export interface FeedEntry {
  title: string;
  url: string;
  date: Date;
}

export async function blogroll(): Promise<FeedEntry[]> {
  const urls = (await Deno.readTextFile("content/blogroll.txt"))
    .split("\n").filter((line) => line.trim().length > 0);
  const all_entries = (await Promise.all(urls.map(blogroll_feed))).flat();
  all_entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return newest_first(all_entries);
}

async function blogroll_feed(
  url: string,
): Promise<FeedEntry[]> {
  let feed;
  try {
    const response = await fetch(url);
    const xml = await response.text();
    feed = await parseFeed(xml);
  } catch (error) {
    console.error({ url, error });
    return [];
  }

  const entries_all: FeedEntry[] = feed.entries.map((entry: any) => {
    return {
      title: entry.title!.value!,
      url: (entry.links.find((it: any) => {
        it.type == "text/html" || it.href!.endsWith(".html");
      }) ?? entry.links[0])!.href!,
      date: (entry.published ?? entry.updated)!,
    };
  });
  return newest_first(entries_all).slice(0, 3);
}

function newest_first(entries: FeedEntry[]): FeedEntry[] {
  return entries.toSorted((a, b) => b.date.getTime() - a.date.getTime());
}
