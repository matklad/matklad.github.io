export type { Atom } from "./src/types/atom.ts";
export type { DeserializationResult } from "./src/types/deserialization_result.ts";
export type { Feed } from "./src/types/feed.ts";
export type { JsonFeed } from "./src/types/json_feed.ts";
export type { RSS1 } from "./src/types/rss1.ts";
export type { RSS2 } from "./src/types/rss2.ts";

export { DublinCoreFields as DublinCore } from "./src/types/fields/dublin_core_fields.ts";
export { FeedType } from "./src/types/feed_type.ts";
export { MediaRssFields as MediaRss } from "./src/types/fields/media_rss_fields.ts";
export { SlashFields as Slash } from "./src/types/fields/slash_fields.ts";

export type { Options } from "./src/deserializer.ts";

export { parseFeed } from "./src/deserializer.ts";
