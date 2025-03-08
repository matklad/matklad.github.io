import { MediaRssFields } from "../types/fields/media_rss_fields.ts";
import type { InternalMediaRss } from "../types/internal/internal_media_rss.ts";
import type { MediaRss } from "./../types/media_rss.ts";

export const copyMedia = (source: InternalMediaRss, target: MediaRss) => {
  [
    MediaRssFields.Rating,
    MediaRssFields.Keywords,
    MediaRssFields.Category,
  ].forEach((fieldName) => {
    const val = (source as any)[fieldName];
    if (val) {
      (target as any)[fieldName] = (val as any).value;
    }
  });

  const mediaGroup = source[MediaRssFields.Group];
  if (mediaGroup && mediaGroup.length > 0) {
    target[MediaRssFields.Group] = mediaGroup.map((group) => {
      return {
        [MediaRssFields.Content]: group[MediaRssFields.Content]?.map((cnt) => ({
          bitrate: cnt.bitrate,
          channels: cnt.channels,
          duration: cnt.duration,
          expression: cnt.expression,
          fileSize: cnt.fileSize,
          height: cnt.height,
          width: cnt.width,
          isDefault: cnt.isDefault,
          lang: cnt.lang,
          medium: cnt.medium,
          samplingrate: cnt.samplingrate,
          type: cnt.type,
          url: cnt.url,
        })),
      };
    });
  }

  const credit = source[MediaRssFields.Credit];
  if (credit) {
    target[MediaRssFields.Credit] = {
      value: credit.value,
      role: credit.role,
      scheme: credit.scheme,
    };
  }

  const title = source[MediaRssFields.Title];
  if (title) {
    target[MediaRssFields.Title] = {
      value: title.value,
      type: title.type,
    };
  }

  const description = source[MediaRssFields.Description];
  if (description) {
    target[MediaRssFields.Description] = {
      value: description.value,
      type: description.type,
    };
  }

  const content = source[MediaRssFields.Content];
  if (content && content.length > 0) {
    target[MediaRssFields.Content] = content?.map((cnt) => ({
      bitrate: cnt.bitrate,
      channels: cnt.channels,
      duration: cnt.duration,
      expression: cnt.expression,
      fileSize: cnt.fileSize,
      height: cnt.height,
      width: cnt.width,
      isDefault: cnt.isDefault,
      lang: cnt.lang,
      medium: cnt.medium,
      samplingrate: cnt.samplingrate,
      type: cnt.type,
      url: cnt.url,
    }));
  }

  const thumbnails = source[MediaRssFields.Thumbnails];
  if (thumbnails) {
    target[MediaRssFields.Thumbnails] = {
      url: thumbnails.url,
      height: thumbnails.height,
      width: thumbnails.width,
      time: thumbnails.time,
    };
  }

  const hash = source[MediaRssFields.Hash];
  if (hash) {
    target[MediaRssFields.Hash] = {
      value: hash.value,
      algo: hash.algo,
    };
  }

  const player = source[MediaRssFields.Player];
  if (player) {
    target[MediaRssFields.Player] = {
      url: player.url,
      height: player.height,
      width: player.width,
    };
  }

  const copyright = source[MediaRssFields.Copyright];
  if (copyright) {
    target[MediaRssFields.Copyright] = {
      url: copyright.url,
      value: copyright.value,
    };
  }

  const text = source[MediaRssFields.Text];
  if (text) {
    target[MediaRssFields.Text] = {
      value: text.value,
      type: text.value,
      lang: text.value,
      start: text.start,
      end: text.end,
    };
  }

  const restriction = source[MediaRssFields.Restriction];
  if (restriction) {
    target[MediaRssFields.Restriction] = {
      value: restriction.value,
      relationship: restriction.relationship,
      type: restriction.type,
    };
  }

  const comments = source[MediaRssFields.Comments];
  if (comments) {
    target[MediaRssFields.Comments] = {
      "media:comment": comments[MediaRssFields.Comment]?.map((x) =>
        x.value
      ) as string[],
    };
  }

  const embed = source[MediaRssFields.Embed];
  if (embed) {
    target[MediaRssFields.Embed] = {
      url: embed.url,
      height: embed.height,
      width: embed.width,
    };

    const mediaParam = embed[MediaRssFields.Param];
    if (mediaParam) {
      (target[MediaRssFields.Embed] as any)[MediaRssFields.Param] = {
        value: mediaParam?.value,
        name: mediaParam?.name,
      };
    }
  }

  const responses = source[MediaRssFields.Responses];
  if (responses) {
    target[MediaRssFields.Responses] = {
      "media:response": responses[MediaRssFields.Response]?.map((x) =>
        x.value
      ) as string[],
    };
  }

  const backLinks = source[MediaRssFields.BackLinks];
  if (backLinks) {
    target[MediaRssFields.BackLinks] = {
      "media:backLink": backLinks[MediaRssFields.BackLink]?.map((x) =>
        x.value
      ) as string[],
    };
  }

  const status = source[MediaRssFields.Status];
  if (status) {
    target[MediaRssFields.Status] = {
      state: status.state,
      reason: status.reason,
    };
  }

  const price = source[MediaRssFields.Price];
  if (price) {
    target[MediaRssFields.Price] = {
      type: price.type,
      price: price.price,
      info: price.info,
      currency: price.currency,
    };
  }

  const license = source[MediaRssFields.License];
  if (license) {
    target[MediaRssFields.License] = {
      value: license.value,
      type: license.type,
      href: license.href,
    };
  }

  const subtitle = source[MediaRssFields.Subtitle];
  if (subtitle) {
    target[MediaRssFields.Subtitle] = {
      type: subtitle.type,
      lang: subtitle.lang,
      href: subtitle.href,
    };
  }

  const peerLink = source[MediaRssFields.PeerLink];
  if (peerLink) {
    target[MediaRssFields.PeerLink] = {
      type: peerLink.type,
      href: peerLink.href,
    };
  }

  const rights = source[MediaRssFields.Rights];
  if (rights) {
    target[MediaRssFields.Rights] = {
      status: rights.status,
    };
  }

  const scenes = source[MediaRssFields.Scenes];
  if (scenes) {
    target[MediaRssFields.Scenes] = {
      "media:scene": scenes[MediaRssFields.Scene]?.map((x) => ({
        sceneTitle: x.sceneTitle,
        sceneDescription: x.sceneDescription,
        sceneStartTime: x.sceneStartTime,
        sceneEndTime: x.sceneEndTime,
      })) as [],
    };
  }
};
