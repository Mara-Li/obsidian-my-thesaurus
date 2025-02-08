import { describe, expect, it } from "bun:test";
import type { ColumnName, Separator, Translation } from "../src/interfaces";
import { getThesaurus } from "../src/utils";
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
	it("should parse a valid CSV content", () => {
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
	it("should throw an error for invalid column names", () => {
		const csvContent = "Invalid,Header\nword1,synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid column names");
	});

	it("should throw an error for invalid separator", () => {
		const csvContent = "Term;Synonyms\nword1;synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid separator: ;");
	});

	it("should throw an error for invalid header length", () => {
		const csvContent = "Term,Synonyms,Extra\nword1,synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Invalid header length: 3");
	});

	it("should throw an error for malformed line", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword2";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow("Malformed line with length: 1");
	});
});
describe("duplicate terms and synonyms", () => {
	it("should not have duplicate terms in the result", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword1,synonym2";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(1);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1", "synonym2"]));
	});

	it("should not have duplicate synonyms in the result", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword1,synonym1";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(1);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1"]));
	});

	it("should not have duplicate terms and synonyms in the result", () => {
		const csvContent = "Term,Synonyms\nword1,synonym1\nword2,synonym1";
		const separator: Separator = ",";
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(Object.keys(thesaurus).length).toBe(2);
		expect(thesaurus["word1"]).toEqual(new Set(["synonym1"]));
		expect(thesaurus["word2"]).toEqual(new Set(["synonym1"]));
	});
});
