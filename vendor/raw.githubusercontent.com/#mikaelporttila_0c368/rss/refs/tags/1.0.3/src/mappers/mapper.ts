import type { InternalAtom } from "../types/internal/internal_atom.ts";
import type { InternalMediaRss } from "../types/internal/internal_media_rss.ts";
import type { InternalRSS1 } from "../types/internal/internal_rss1.ts";
import type { InternalRSS2 } from "../types/internal/internal_rss2.ts";

import type { Feed } from "./../types/feed.ts";
import type { FeedEntry } from "./../types/feed.ts";
import type { JsonFeed } from "./../types/json_feed.ts";
import { AtomFields } from "./../types/fields/atom_fields.ts";
import { DublinCoreFields } from "./../types/fields/dublin_core_fields.ts";
import { Rss2Fields } from "./../types/fields/rss2_fields.ts";

import { copyValueFields, isValidURL } from "./../util.ts";
import { FeedType } from "./../types/feed_type.ts";
import { SlashFieldArray } from "./../types/slash.ts";
import { copyMedia } from "./media_mapper.ts";
import { DublinCoreFieldArray } from "../types/internal/internal_dublin_core.ts";

export const toFeed = (
  feedType: FeedType,
  feed: InternalAtom | InternalRSS2 | InternalRSS1 | JsonFeed,
): Feed | null => {
  if (!feed) {
    return null;
  }

  switch (feedType) {
    case FeedType.Atom:
      return mapAtomToFeed(feed as InternalAtom);
    case FeedType.Rss1:
      return mapRssToFeed(feed as InternalRSS1);
    case FeedType.Rss2:
      return mapRss2ToFeed(feed as InternalRSS2);
    default:
      return null;
  }
};

const mapRssToFeed = (rss: InternalRSS1): Feed => {
  const {
    title,
    description,
    link,
    ...rest
  } = rss.channel;

  const result = (rest as any) as Feed;
  copyValueFields(DublinCoreFieldArray, rss.channel, result);
  result.type = FeedType.Rss1;

  const titleValue = result[DublinCoreFields.Title] || title?.value;
  if (titleValue) {
    result.title = {
      value: titleValue,
      type: undefined,
    };
  }

  result.links = [];
  if (result[DublinCoreFields.URI]) {
    result.links.push(result[DublinCoreFields.URI] as string);
    result.id = result[DublinCoreFields.URI] as string;
  }

  if (link?.value) {
    result.links.push(link.value);
    result.id = link.value;
  }

  result.description = result[DublinCoreFields.Description] ||
    description?.value;
  result.copyright = result[DublinCoreFields.Rights];
  result.language = result[DublinCoreFields.Language];
  result.created = result[DublinCoreFields.Created] ||
    result[DublinCoreFields.DateSubmitted] || result[DublinCoreFields.Date];
  result.createdRaw = result[DublinCoreFields.CreatedRaw] ||
    result[DublinCoreFields.DateSubmittedRaw] ||
    result[DublinCoreFields.DateRaw];
  result.published = result[DublinCoreFields.DateSubmitted] ||
    result[DublinCoreFields.Date];
  result.publishedRaw = result[DublinCoreFields.DateSubmittedRaw] ||
    result[DublinCoreFields.DateRaw];
  result.updateDate = result[DublinCoreFields.Date];
  result.updateDateRaw = result[DublinCoreFields.DateRaw];

  const creators = result[DublinCoreFields.Creator];
  if (creators && creators.length > 0) {
    result.author = createAuthor(undefined, creators[0]);
  }

  if (rss.image) {
    result.image = {
      link: rss.image.link?.value as string,
      title: rss.image.title?.value as string,
      url: rss.image.url?.value as string,
    };
  }

  result.entries = rss.item?.map((item) => {
    const {
      link,
      title,
      description,
      ...itemRest
    } = item;

    const entry = (itemRest as any) as FeedEntry;
    copyValueFields(DublinCoreFieldArray, entry, entry);
    copyValueFields(SlashFieldArray, entry, entry);

    entry.id = entry[DublinCoreFields.URI] || link?.value as string;
    entry.published = entry[DublinCoreFields.DateSubmitted] ||
      entry[DublinCoreFields.Date];
    entry.publishedRaw = entry[DublinCoreFields.DateSubmittedRaw] ||
      entry[DublinCoreFields.DateRaw];
    entry.updated = entry[DublinCoreFields.Date] ||
      entry[DublinCoreFields.DateSubmitted];
    entry.updatedRaw = entry[DublinCoreFields.DateRaw] ||
      entry[DublinCoreFields.DateSubmittedRaw];

    const entryCreators = entry[DublinCoreFields.Creator];
    if (entryCreators && entryCreators.length > 0) {
      entry.author = createAuthor(undefined, entryCreators[0]);
    }

    const itemTitle = entry[DublinCoreFields.Title] || title?.value;
    if (itemTitle) {
      entry.title = {
        value: itemTitle,
        type: undefined,
      };
    }

    const itemDescription = entry[DublinCoreFields.Description] ||
      description?.value;
    if (itemDescription) {
      entry.description = {
        value: itemDescription,
        type: undefined,
      };
    }

    entry.links = [];
    if (entry[DublinCoreFields.URI]) {
      entry.links.push({
        href: entry[DublinCoreFields.URI],
      });
    }

    if (link?.value) {
      entry.links.push({
        href: link.value,
      });
    }

    entry.contributors = entry[DublinCoreFields.Contributor]?.map((
      contributor,
    ) => ({
      name: contributor,
    }));

    return entry;
  }) ?? [];

  return result;
};

const mapRss2ToFeed = (rss: InternalRSS2): Feed => {
  const {
    items,
    title,
    description,
    generator,
    pubDate,
    pubDateRaw,
    lastBuildDate,
    lastBuildDateRaw,
    docs,
    webMaster,
    language,
    copyright,
    ttl,
    skipDays,
    skipHours,
    link,
    image,
    ...rest
  } = rss.channel;

  const result = (rest as any) as Feed;
  result.type = FeedType.Rss2;
  copyValueFields(DublinCoreFieldArray, result, result);

  result.id = link?.value as string || result[DublinCoreFields.URI] as string;
  result.title = {
    value: result[DublinCoreFields.Title] || title?.value,
    type: undefined,
  };

  const commonDate = result[DublinCoreFields.DateSubmitted] ||
    result[DublinCoreFields.Date] || pubDate?.value;
  const commonDateRaw = result[DublinCoreFields.DateSubmittedRaw] ||
    result[DublinCoreFields.DateRaw] || pubDateRaw?.value;

  result.description = description?.value ||
    result[DublinCoreFields.Description];
  result.generator = generator?.value;
  result.published = commonDate;
  result.publishedRaw = commonDateRaw;
  result.created = result[DublinCoreFields.Created] || lastBuildDate?.value ||
    commonDate;
  result.createdRaw = result[DublinCoreFields.CreatedRaw] ||
    lastBuildDateRaw?.value || commonDateRaw;
  result.updateDate = lastBuildDate?.value || result[DublinCoreFields.Date];
  result.updateDateRaw = lastBuildDateRaw?.value ||
    result[DublinCoreFields.DateRaw];
  result.docs = docs?.value;
  result.language = language?.value;
  result.copyright = copyright?.value || result[DublinCoreFields.Rights];
  result.ttl = ttl?.value;
  result.skipDays = skipDays?.day?.map((x) => x.value as string);
  result.skipHours = skipHours?.hour?.map((x) => x.value as number);
  result.links = [
    link?.value,
    result[DublinCoreFields.URI],
  ].filter((x) => !!x) as string[];

  const creators = result[DublinCoreFields.Creator];
  if (webMaster?.value) {
    result.author = createAuthor(webMaster.value);
  } else if (creators && creators?.length > 0) {
    result.author = createAuthor(undefined, creators[0]);
  }

  if (image) {
    result.image = {
      link: image.link?.value as string,
      title: image.title?.value as string,
      url: image.url?.value as string,
      height: image?.height?.value,
      width: image?.width?.value,
    };
  }

  result.entries = items?.map((item) => {
    const {
      author,
      title,
      description,
      guid,
      link,
      pubDate,
      pubDateRaw,
      enclosure,
      comments,
      categories,
      ...itemRest
    } = item;

    const entry = itemRest as FeedEntry;
    copyValueFields(DublinCoreFieldArray, entry, entry);
    copyMedia(entry as InternalMediaRss, entry);

    entry.id = guid?.value as string || entry[DublinCoreFields.URI] as string;

    const titleValue = entry[DublinCoreFields.Title] || title?.value;
    if (titleValue) {
      entry.title = {
        value: titleValue,
        type: undefined,
      };
    }

    const descriptionValue = entry[DublinCoreFields.Description] ||
      description?.value;
    if (descriptionValue) {
      entry.description = {
        value: descriptionValue,
        type: undefined,
      };
    }

    entry.comments = comments?.value;
    entry.published = entry[DublinCoreFields.DateSubmitted] || pubDate?.value;
    entry.publishedRaw = entry[DublinCoreFields.DateSubmittedRaw] ||
      pubDateRaw?.value;
    entry.updated = pubDate?.value;
    entry.updatedRaw = item.pubDateRaw?.value;

    if (item[Rss2Fields.ContentEncoded]?.value) {
      entry.content = {
        value: item[Rss2Fields.ContentEncoded]?.value,
      };
    }

    const creators = entry[DublinCoreFields.Creator];
    if (author?.value) {
      entry.author = createAuthor(undefined, author.value);
    } else if (creators && creators.length > 0) {
      entry.author = createAuthor(undefined, creators[0]);
    }

    entry.links = [];

    if (item[Rss2Fields.FeedburnerOrigLink]?.value) {
      entry.links.push({ href: item[Rss2Fields.FeedburnerOrigLink]?.value });
    }

    if (link?.value) {
      entry.links.push({ href: link?.value });
    }

    if (enclosure) {
      entry.attachments = enclosure.map((x) => ({
        url: x.url,
        mimeType: x.type,
        sizeInBytes: x.length,
      }));
    }

    entry.categories = categories?.map((category) => ({
      term: category.value,
      label: category.value,
    }));

    entry.contributors = result[DublinCoreFields.Contributor]?.map((
      contributor,
    ) => ({
      name: contributor,
    }));

    return entry;
  }) ?? [];

  return (result as any);
};

const mapAtomToFeed = (atom: InternalAtom): Feed => {
  const {
    id,
    generator,
    title,
    subtitle,
    updated,
    updatedRaw,
    icon,
    links,
    logo,
    categories,
    author,
    entries,
    ...rest
  } = atom;

  const result = (rest as any) as Feed;
  result.type = FeedType.Atom;
  result.id = id?.value as string;
  result.generator = generator?.value;
  result.title = {
    value: title?.value,
    type: title?.type,
  };
  result.description = subtitle?.value;
  result.updateDate = updated?.value;
  result.updateDateRaw = updatedRaw?.value;
  result.published = updated?.value;
  result.publishedRaw = updatedRaw?.value;
  result.created = updated?.value;
  result.createdRaw = updatedRaw?.value;
  result.icon = icon?.value;
  result.links = links?.map((x) => x.href) ?? [];

  if (logo) {
    result.image = {
      link: logo.value as string,
      url: logo.value as string,
    };
  }

  if (categories) {
    result.categories = categories?.map((category) => ({
      term: category.term,
      label: category.label,
    }));
  }

  if (author) {
    result.author = {
      name: author.name?.value,
      email: author.email?.value,
      uri: author.uri?.value,
    };
  }

  result.entries = entries?.map((atomEntry) => {
    const {
      links,
      href,
      id,
      title,
      summary,
      published,
      publishedRaw,
      updated,
      updatedRaw,
      source,
      author,
      content,
      contributors,
      categories,
      ...entryRest
    } = atomEntry;

    const entry = entryRest as FeedEntry;
    entry.id = atomEntry[AtomFields.FeedburnerOrigLink]?.value ||
      id?.value as string;
    entry.published = published?.value;
    entry.publishedRaw = publishedRaw?.value;
    entry.updated = updated?.value;
    entry.updatedRaw = updatedRaw?.value;

    if (title) {
      entry.title = {
        value: title.value,
        type: title.type,
      };
    }

    if (summary) {
      entry.description = {
        value: summary.value,
        type: summary.type,
      };
    }

    entry.links = [];
    if (atomEntry[AtomFields.FeedburnerOrigLink]?.value) {
      entry.links.push({
        href: atomEntry[AtomFields.FeedburnerOrigLink]?.value as string,
      });
    }

    if (links && links?.length > 0) {
      for (const link of links) {
        entry.links.push({
          href: link.href,
          rel: link.rel,
          type: link.type,
        });
      }

      entry.attachments = links.filter((x) => x.rel === "enclosure").map((
        x,
      ) => ({
        url: x.href,
        mimeType: x.type,
        sizeInBytes: x.length,
      }));
    }

    if (href) {
      entry.links.push({ href });
    }

    if (id && isValidURL(id.value as string)) {
      entry.links.push({ href: id.value });
    }

    if (source) {
      entry.source = {
        id: source.id?.value,
        title: source.title?.value,
        updated: source.updated?.value,
        updatedRaw: source.updatedRaw?.value,
      };
    }

    if (author) {
      entry.author = {
        email: author.email?.value,
        name: author.name?.value,
        uri: author.uri?.value,
      };
    }

    if (content) {
      entry.content = {
        value: content?.value,
        type: content?.type,
      };
    }

    if (contributors) {
      entry.contributors = contributors?.map((x) => ({
        name: x.name?.value,
        email: x.email?.value,
        uri: x.uri?.value,
      }));
    }

    if (categories) {
      entry.categories = categories?.map((x) => ({
        term: x.term,
        label: x.label,
      }));
    }

    return entry;
  }) ?? [];

  return result;
};

const createAuthor = (email?: string, name?: string, uri?: string) => ({
  email,
  name,
  uri,
});
