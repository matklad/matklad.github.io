import type { ValueField } from "../value_field.ts";
import { DublinCoreFields } from "../fields/dublin_core_fields.ts";

// Based on https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
export interface InternalDublinCore {
  [DublinCoreFields.Contributor]?: ValueField<string>[];
  [DublinCoreFields.Coverage]?: ValueField<string>;
  [DublinCoreFields.Creator]?: ValueField<string>[];
  [DublinCoreFields.Date]?: ValueField<Date>;
  [DublinCoreFields.DateRaw]?: ValueField<string>;
  [DublinCoreFields.Description]?: ValueField<string>;
  [DublinCoreFields.Format]?: ValueField<string>;
  [DublinCoreFields.Language]?: ValueField<string>;
  [DublinCoreFields.Identifier]?: ValueField<string>;
  [DublinCoreFields.Publisher]?: ValueField<string>;
  [DublinCoreFields.Relation]?: ValueField<string>;
  [DublinCoreFields.Rights]?: ValueField<string>;
  [DublinCoreFields.Source]?: ValueField<string>;
  [DublinCoreFields.Subject]?: ValueField<string>;
  [DublinCoreFields.Title]?: ValueField<string>;
  [DublinCoreFields.Type]?: ValueField<string>;
  [DublinCoreFields.Abstract]?: ValueField<string>;
  [DublinCoreFields.AccessRights]?: ValueField<string>;
  [DublinCoreFields.AccrualMethod]?: ValueField<string>;
  [DublinCoreFields.AccrualPeriodicity]?: ValueField<string>;
  [DublinCoreFields.AccrualPolicy]?: ValueField<string>;
  [DublinCoreFields.Alternative]?: ValueField<string>;
  [DublinCoreFields.Audience]?: ValueField<string>;
  [DublinCoreFields.Available]?: ValueField<string>;
  [DublinCoreFields.BibliographicCitation]?: ValueField<string>;
  [DublinCoreFields.ConformsTo]?: ValueField<string>;
  [DublinCoreFields.Created]?: ValueField<Date>;
  [DublinCoreFields.CreatedRaw]?: ValueField<string>;
  [DublinCoreFields.DateAccepted]?: ValueField<Date>;
  [DublinCoreFields.DateAcceptedRaw]?: ValueField<string>;
  [DublinCoreFields.Copyrighted]?: ValueField<Date>;
  [DublinCoreFields.CopyrightedRaw]?: ValueField<string>;
  [DublinCoreFields.DateSubmitted]?: ValueField<Date>;
  [DublinCoreFields.DateSubmittedRaw]?: ValueField<string>;
  [DublinCoreFields.EducationLevel]?: ValueField<string>;
  [DublinCoreFields.Extent]?: ValueField<string>;
  [DublinCoreFields.HasFormat]?: ValueField<string>;
  [DublinCoreFields.HasPart]?: ValueField<string>;
  [DublinCoreFields.HasVersion]?: ValueField<string>;
  [DublinCoreFields.InstructionalMethod]?: ValueField<string>;
  [DublinCoreFields.IsFormatOf]?: ValueField<string>;
  [DublinCoreFields.IsPartOf]?: ValueField<string>;
  [DublinCoreFields.IsReferencedBy]?: ValueField<string>;
  [DublinCoreFields.IsReplacedBy]?: ValueField<string>;
  [DublinCoreFields.IsRequiredBy]?: ValueField<string>;
  [DublinCoreFields.Issued]?: ValueField<string>;
  [DublinCoreFields.IsVersionOf]?: ValueField<string>;
  [DublinCoreFields.License]?: ValueField<string>;
  [DublinCoreFields.Mediator]?: ValueField<string>;
  [DublinCoreFields.Medium]?: ValueField<string>;
  [DublinCoreFields.Modified]?: ValueField<Date>;
  [DublinCoreFields.ModifiedRaw]?: ValueField<string>;
  [DublinCoreFields.Provenance]?: ValueField<string>;
  [DublinCoreFields.References]?: ValueField<string>;
  [DublinCoreFields.Replaces]?: ValueField<string>;
  [DublinCoreFields.Requires]?: ValueField<string>;
  [DublinCoreFields.RightsHolder]?: ValueField<string>;
  [DublinCoreFields.Spatial]?: ValueField<string>;
  [DublinCoreFields.TableOfContents]?: ValueField<string>;
  [DublinCoreFields.Tempora]?: ValueField<string>;
  [DublinCoreFields.Valid]?: ValueField<Date>[];
  [DublinCoreFields.Box]?: ValueField<string>;
  [DublinCoreFields.DCMIType]?: ValueField<string>[];
  [DublinCoreFields.DDC]?: ValueField<string>;
  [DublinCoreFields.IMT]?: ValueField<string>;
  [DublinCoreFields.ISO3166]?: ValueField<string>;
  [DublinCoreFields.ISO6392]?: ValueField<string>;
  [DublinCoreFields.LLC]?: ValueField<string>;
  [DublinCoreFields.LCSH]?: ValueField<string>;
  [DublinCoreFields.MESH]?: ValueField<string>;
  [DublinCoreFields.NLM]?: ValueField<string>;
  [DublinCoreFields.Period]?: ValueField<string>;
  [DublinCoreFields.Point]?: ValueField<string>;
  [DublinCoreFields.RFC1766]?: ValueField<string>;
  [DublinCoreFields.RFC3066]?: ValueField<string>;
  [DublinCoreFields.TGN]?: ValueField<string>[];
  [DublinCoreFields.UDC]?: ValueField<string>;
  [DublinCoreFields.URI]?: ValueField<string>;
  [DublinCoreFields.W3CDTF]?: ValueField<string>;
}

export const DublinCoreFieldArray = [
  DublinCoreFields.Contributor,
  DublinCoreFields.Coverage,
  DublinCoreFields.Creator,
  DublinCoreFields.Date,
  DublinCoreFields.DateRaw,
  DublinCoreFields.Description,
  DublinCoreFields.Format,
  DublinCoreFields.Language,
  DublinCoreFields.Identifier,
  DublinCoreFields.Publisher,
  DublinCoreFields.Relation,
  DublinCoreFields.Rights,
  DublinCoreFields.Source,
  DublinCoreFields.Subject,
  DublinCoreFields.Title,
  DublinCoreFields.Type,
  DublinCoreFields.Abstract,
  DublinCoreFields.AccessRights,
  DublinCoreFields.AccrualMethod,
  DublinCoreFields.AccrualPeriodicity,
  DublinCoreFields.AccrualPolicy,
  DublinCoreFields.Alternative,
  DublinCoreFields.Audience,
  DublinCoreFields.Available,
  DublinCoreFields.BibliographicCitation,
  DublinCoreFields.ConformsTo,
  DublinCoreFields.Created,
  DublinCoreFields.CreatedRaw,
  DublinCoreFields.DateAccepted,
  DublinCoreFields.DateAcceptedRaw,
  DublinCoreFields.Copyrighted,
  DublinCoreFields.CopyrightedRaw,
  DublinCoreFields.DateSubmitted,
  DublinCoreFields.DateSubmittedRaw,
  DublinCoreFields.EducationLevel,
  DublinCoreFields.Extent,
  DublinCoreFields.HasFormat,
  DublinCoreFields.HasPart,
  DublinCoreFields.HasVersion,
  DublinCoreFields.InstructionalMethod,
  DublinCoreFields.IsFormatOf,
  DublinCoreFields.IsPartOf,
  DublinCoreFields.IsReferencedBy,
  DublinCoreFields.IsReplacedBy,
  DublinCoreFields.IsRequiredBy,
  DublinCoreFields.Issued,
  DublinCoreFields.IsVersionOf,
  DublinCoreFields.License,
  DublinCoreFields.Mediator,
  DublinCoreFields.Medium,
  DublinCoreFields.Modified,
  DublinCoreFields.ModifiedRaw,
  DublinCoreFields.Provenance,
  DublinCoreFields.References,
  DublinCoreFields.Replaces,
  DublinCoreFields.Requires,
  DublinCoreFields.RightsHolder,
  DublinCoreFields.Spatial,
  DublinCoreFields.TableOfContents,
  DublinCoreFields.Tempora,
  DublinCoreFields.Valid,
  DublinCoreFields.Box,
  DublinCoreFields.DCMIType,
  DublinCoreFields.DDC,
  DublinCoreFields.IMT,
  DublinCoreFields.ISO3166,
  DublinCoreFields.ISO6392,
  DublinCoreFields.LLC,
  DublinCoreFields.LCSH,
  DublinCoreFields.MESH,
  DublinCoreFields.NLM,
  DublinCoreFields.Period,
  DublinCoreFields.Point,
  DublinCoreFields.RFC1766,
  DublinCoreFields.RFC3066,
  DublinCoreFields.TGN,
  DublinCoreFields.UDC,
  DublinCoreFields.URI,
  DublinCoreFields.W3CDTF,
];
