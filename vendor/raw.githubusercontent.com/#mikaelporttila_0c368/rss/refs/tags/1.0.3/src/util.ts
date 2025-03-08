export const isValidURL = (text: string) => {
  let url: URL;
  try {
    url = new URL(text);
  } catch (_) {
    return false;
  }
  return ["https:", "http:", "ftp://", "mailto:", "news://"].includes(
    url.protocol,
  );
};

export const copyValueFields = (fields: string[], source: any, target: any) => {
  fields.forEach((fieldName: string) => {
    const field = source[fieldName];
    if (field) {
      target[fieldName] = Array.isArray(field)
        ? field.map((x) => (x?.value || x))
        : (field?.value || field);
    }
  });
};
