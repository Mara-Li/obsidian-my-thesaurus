import type { TFunction } from "i18next";

export interface MyThesaurusSettings {
	thesaurusPath: string;
	includedPaths: string[];
	separator: Separator;
	columns: ColumnName;
}

export type ColumnName = {
	term: string;
	synonyms: string;
};

export type ParseResult = {
	file: string;
	tags: string[];
	errors?: string;
	type?: "success" | "error" | "skip";
};

export type ParseResults = ParseResult[];

export type Separator = ";" | "," | "\t" | "|";

export type Thesaurus = Record<string, Set<string>>;
export type Translation = TFunction<"translation", undefined>;

export const DEFAULT_SETTINGS: MyThesaurusSettings = {
	thesaurusPath: "",
	includedPaths: [],
	separator: ";",
	columns: {
		term: "term",
		synonyms: "synonyms",
	},
};
