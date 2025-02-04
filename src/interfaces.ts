import type { TFunction } from "i18next";

export interface MyThesaurusSettings {
	thesaurusPath: string;
	excludedPath: string[];
	separator: Separator;
	columns: ColumnName;
}

export type ColumnName = {
	term: string;
	synonyms: string;
};

export type Separator = ";" | "," | "\t" | "|";

export type Thesaurus = Record<string, Set<string>>;
export type Translation = TFunction<"translation", undefined>;

export const DEFAULT_SETTINGS: MyThesaurusSettings = {
	thesaurusPath: "",
	excludedPath: [],
	separator: ";",
	columns: {
		term: "term",
		synonyms: "synonyms",
	},
};
