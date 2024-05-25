// deno-lint-ignore-file
import * as xml from "https://deno.land/x/xml@2.0.4/mod.ts";
import { parseFeed } from "jsr:@mikaelporttila/rss@1.0.3";

export async function blogroll(): Promise<FeedEntry[]> {
  const entries = await blogroll_entries("content/blogroll.opml");
  const all_entries = (await Promise.all(entries.map(blogroll_feed))).flat();
  all_entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  return all_entries;
}

interface Feed {
  title: string;
  url: string;
}

async function blogroll_entries(opml_file: string): Promise<Feed[]> {
  const opml = await Deno.readTextFile(opml_file);
  const raw = xml.parse(opml) as any;
  return raw.opml.body.outline.map((it: any) => {
    return {
      title: it["@text"],
      url: it["@xmlUrl"],
    };
  });
}

export interface FeedEntry {
  title: string;
  url: string;
  date: Date;
}

async function blogroll_feed(entry: Feed): Promise<FeedEntry[]> {
  const response = await fetch(entry.url);
  const xml = await response.text();
  const feed = await parseFeed(xml);

  return feed.entries.map((it) => {
    return {
      title: it.title!.value!,
      url: it.links.find((it) =>
        it.type == "text/html" || it.href!.endsWith(".html")
      )!.href!,
      date: (it.published ?? it.updated)!,
    };
  }).slice(0, 3);
}
