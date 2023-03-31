#!/usr/bin/env -S deno run --allow-write --allow-read

/*
TODO:
- footnotes (unsafe is a human-assited type system)
- stripes in highlighted lines
*/

const path = Deno.args[0];
let s = await Deno.readTextFile(path);
s = s.replace(":page-liquid:\n", "");
s = s.replaceAll("{cpp}", "C++");
s = s.replace(/^(=+ )/mg, (m) => {
  return "#".repeat(m.length - 1) + " ";
});
s = s.replace(/(http\S*?)(\[.*?(\n.*?)?\])/mg, (m, link, text) => {
  return `${text}(${link})`;
});
s = s.replace(/^:(\w*?): (.*?)$/mg, (m, ref, link) => {
  return `[${ref}]: ${link}`;
});
s = s.replace(/\{(\w*?)\}\[(.*?)\]/mg, (m, ref, text) => {
  return `[${text}][${ref}]`;
});
s = s.replace(/^\[source\]\n----\n((.|\n)*?)\n----/mg, (m, code) => {
  return "```\n" + code + "\n```";
});
s = s.replace(
  /^\[source,(kotlin|cpp|rust|swift|c|toml|go|console|js|ts|nix)(,highlight=.*?)?\]\n----\n((.|\n)*?)\n----/mg,
  (m, lang, hl, code) => {
    let highlight = "";
    if (hl) {
      highlight = hl.substring(",highlight=".length).replaceAll("..", "-")
        .replaceAll(";", ",").replaceAll('"', "");
      highlight = `{highlight="${highlight}"}\n`;
    }
    return highlight + "```" + lang + "\n" + code + "\n```";
  },
);
s = s.replace(
  /^\[source(,highlight=.*?)\]\n----\n((.|\n)*?)\n----/mg,
  (m, hl, code) => {
    let highlight = "";
    if (hl) {
      highlight = hl.substring(",highlight=".length).replaceAll("..", "-")
        .replaceAll(";", ",").replaceAll('"', "");
      highlight = `{highlight="${highlight}"}\n`;
    }
    return highlight + "```\n" + code + "\n```";
  },
);
s = s.replace(/^\.(.*?)$\n```/mg, (m, title) => {
  return `{cap="${title}"}` + "\n```";
});
s = s.replace(/^image::(.*)\[\]$/mg, (m, path) => {
  return `![](${path})`;
});
s = s.replace(/kbd:\[(.*?)\]/mg, (m, text) => {
  return `[${text}]{.kbd}`;
});
s = s.replace(/(\n\. .*?$(\n\s\s.*?$)*){2,}/mg, (m, text) => {
  let i = 0;
  return m.replace(/^\. /mg, (m) => {
    i += 1;
    return `${i}. `;
  });
});
s = s.replace(
  /\[(NOTE|Note)\]\n====\n((.|\n)*?)\n====\n/mg,
  (m, note, content) => {
    return `::: note\n${content}\n:::\n`;
  },
);
s = s.replace(/^NOTE: (.*?)$/mg, (m, content) => {
  return `::: note\n${content}\n:::\n`;
});
s = s.replace(/^\*\*\*\*\n((.|\n)*?)\n\*\*\*\*\n/mg, (m, content) => {
  return `::: block\n${content}\n:::\n`;
});
s = s.replace(/"`(\w.*?(\w|\?))`"/mg, (m, w) => {
  return `"${w}"`;
});
s = s.replace(/^(http(s)?:\/\/.*)$/mg, (m) => {
  return `<${m}>`;
});
s = s.replace(/`\+(.*?)\+`/mg, (m, w) => {
  return "`" + w + "`";
});

await Deno.writeTextFile(path, s);
