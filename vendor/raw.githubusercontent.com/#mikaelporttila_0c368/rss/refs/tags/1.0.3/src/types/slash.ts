import { SlashFields } from "./fields/slash_fields.ts";
import type { ValueField } from "./value_field.ts";

// Based of https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
export interface SlashValueFields {
  [SlashFields.Department]?: ValueField<string>;
  [SlashFields.Section]?: ValueField<string>;
  [SlashFields.Comments]?: ValueField<number>;
  [SlashFields.HitParade]?: ValueField<string>;
}

export interface Slash {
  [SlashFields.Department]?: string;
  [SlashFields.Section]?: string;
  [SlashFields.Comments]?: number;
  [SlashFields.HitParade]?: string;
}

export const SlashFieldArray = [
  SlashFields.Department,
  SlashFields.Section,
  SlashFields.Comments,
  SlashFields.HitParade,
];
