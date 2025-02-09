import { describe, expect, it } from "bun:test";
import type { ColumnName, Separator, Translation } from "../src/interfaces";
import { getHeader, getThesaurus } from "../src/utils";
import "uniformize";

const mockTranslation = ((key: string, options?: any) => {
	const translations: { [key: string]: string } = {
		"error.csv.columns": "Invalid column names",
		"error.csv.separator": `Invalid separator: ${options?.sep}`,
		"error.csv.header": `Invalid header length: ${options?.len}`,
		"error.csv.malformed": `Malformed line with length: ${options?.len}`,
	};
	return translations[key] || key;
}) as Translation;
const columnNames: ColumnName = { term: "Term", synonyms: "Synonyms" };
describe("getThesaurus", () => {
	it("passing", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword2,synonym2";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(thesaurus).toEqual({
			word1: new Set(["synonym1"]),
			word2: new Set(["synonym2"]),
		});
	});
});
describe("error handling", () => {
	it("invalid column names", () => {
		const csvContent = "Invalid,Header\nword1,synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid column names");
	});

	it("invalid separator", () => {
		const csvContent = "Term;Synonyms\nword1;synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid separator: ;");
	});

	it("invalid header length", () => {
		const csvContent = "Term,Synonyms,Extra\nword1,synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid header length: 3");
	});

	it("malformed line", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword2";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Malformed line with length: 1");
	});
});
describe("duplicate terms and synonyms", () => {
	it("terms", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword1,synonym2";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(1);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1", "synonym2"]));
	});

	it("synonyms", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword1,synonym1";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(1);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1"]));
	});

	it("terms and synonyms", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword2,synonym1";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(2);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1"]));
		expect(thesaurus["word2"]).toEqual(new Set(["synonym1"]));
	});
});
describe("markdown table", () => {
	it("validate header", () => {
		const csvContent =
			"| Term | Synonyms |\n| --- | --- |\n| word1 | synonym1\nword2 | synonym2 |";
		const separator: Separator = "|";
		const fileContent = csvContent.split("\n");
		const header = getHeader(fileContent, separator, mockTranslation);
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
	it("too much column", () => {
		const csvContent =
			"| Tag  | Synonyme  |Extra|\n" +
			"| ----- | -------- |--|\n" +
			"| word1 | synonym1 |machin|\n" +
			"| word2 | synonym2 |truc|";
		const separator: Separator = "md";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid header length: 3");
	});
});
