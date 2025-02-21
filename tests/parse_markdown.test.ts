import { describe, expect, it } from "bun:test";
import type { Separator } from "../src/interfaces";
import { getHeader, getThesaurus } from "../src/utils";
import { columnNames, mockTranslation } from "./__constants__";
import "uniformize";
import { getColumn } from "../src/utils/parse_csv";
it("validate header", () => {
	const csvContent =
		"| Term | Synonyms |\n| --- | --- |\n| word1 | synonym1\nword2 | synonym2 |";
	const separator: Separator = "|";
	const fileContent = csvContent.split("\n");
	const header = getHeader(fileContent, separator);
	expect(header).toEqual(["Term", "Synonyms"]);
});
it("passing", () => {
	const csvContent =
		"| Term  | Synonyms  |\n" +
		"| ----- | -------- |\n" +
		"| word1 | synonym1 |\n" +
		"| word2 | synonym2 |\n";
	const separator: Separator = "md";
	const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
	expect(thesaurus).toEqual({
		word1: new Set(["synonym1"]),
		word2: new Set(["synonym2"]),
	});
});
it("with accents", () => {
	const csvContent =
		"| Term  | Synonyms  |\n" +
		"| ----- | -------- |\n" +
		"| café | café |\n" +
		"| rôle | rôle |\n";
	const expected = {
		café: new Set(["cafe"]),
		rôle: new Set(["role"]),
	};
	const separator: Separator = "md";
	const thesaurus = getThesaurus(
		csvContent,
		separator,
		mockTranslation,
		columnNames,
		true
	);
	expect(thesaurus).toEqual(expected);
});
describe("More than two columns", () => {
	const csvContent =
		"| Term  | Synonyms  | Definition  |\n" +
		"| ----- | -------- | ---------- |\n" +
		"| word1 | synonym1 | definition1 |\n" +
		"| word2 | synonym2 | definition2 |\n";
	const expected = {
		word1: new Set(["synonym1"]),
		word2: new Set(["synonym2"]),
	};
	it("get thesaurus", () => {
		const separator: Separator = "md";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(thesaurus).toEqual(expected);
	});
	it("verify header", () => {
		const separator: Separator = "|";
		const fileContent = csvContent.split("\n");
		const header = getHeader(fileContent, separator);
		const expectedColumnIndex = {
			indexKey: 0,
			indexSynonyms: 1,
		};
		const column = getColumn(header, columnNames, mockTranslation);
		expect(column).toEqual(expectedColumnIndex);
	});
	it("shouldn't pass : not recognize column", () => {
		const separator: Separator = "md";
		const invalidColumnNames = { term: "Word", synonyms: "Synonyms" };
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, invalidColumnNames)
		).toThrow(mockTranslation("error.csv.columns"));
	});
	it("Not ordered columns", () => {
		const csvContent =
			"| Term  | Definition  | Synonyms  |\n" +
			"| ----- | -------- | ---------- |\n" +
			"| word1 | Def2 | synonym1 |\n" +
			"| word2 | Def1 | synonym2 |\n";
		const separator: Separator = "md";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(thesaurus).toEqual({
			word1: new Set(["synonym1"]),
			word2: new Set(["synonym2"]),
		});
	});
});
