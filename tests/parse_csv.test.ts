import { describe, expect, it } from "bun:test";
import type { Separator } from "../src/interfaces";
import { getHeader, getThesaurus } from "../src/utils";
import "uniformize";
import { getColumn } from "../src/utils/parse_csv";
import { columnNames, mockTranslation } from "./__constants__";

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

	it("malformed line", () => {
		const csvContent = "xxx,xxxx\nword1,synonym1";
		const separator: Separator = ",";
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow(mockTranslation("error.csv.columns"));
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

it("with accents", () => {
	const csvContent = "Term,Synonyms\ncafé,café\nrôle,rôle";
	const expected = {
		café: new Set(["cafe"]),
		rôle: new Set(["role"]),
	};
	const separator: Separator = ",";
	const thesaurus = getThesaurus(
		csvContent,
		separator,
		mockTranslation,
		columnNames,
		true
	);
	expect(thesaurus).toEqual(expected);
});

describe("more than two column", () => {
	const csvContent = "Term,Synonyms,Extra\nword1,synonym1, notes";
	const separator: Separator = ",";
	it("pass with a simple csv", () => {
		const expectedColumnIndex = {
			indexKey: 0,
			indexSynonyms: 1,
		};
		const header = getHeader(csvContent.split("\n"), separator);
		const column = getColumn(header, columnNames, mockTranslation);
		expect(column).toEqual(expectedColumnIndex);
	});
	it("should error for invalid column names", () => {
		const columnNames = { term: "Terms", synonyms: "Synonyme" };
		const header = getHeader(csvContent.split("\n"), separator);
		expect(() => getColumn(header, columnNames, mockTranslation)).toThrow(
			"Invalid column names"
		);
	});
	it("thesaurus pass", () => {
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(thesaurus).toEqual({
			word1: new Set(["synonym1"]),
		});
	});
});

describe("Unordered columns", () => {
	const csvContent = "Term, Definition, Synonyms\nword1, definition1, synonym1";
	const separator: Separator = ",";
	describe("should pass", () => {
		const expectedColumnIndex = {
			indexKey: 0,
			indexSynonyms: 2,
		};
		const header = getHeader(csvContent.split("\n"), separator);
		const column = getColumn(header, columnNames, mockTranslation);
		expect(column).toEqual(expectedColumnIndex);
	});
	it("shouldn't pass : not recognize column", () => {
		const invalidColumnNames = { term: "Word", synonyms: "Synonyms" };
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, invalidColumnNames)
		).toThrow("Invalid column names");
	});
	it("getThesaurus", () => {
		const thesaurus = getThesaurus(csvContent, separator, mockTranslation, columnNames);
		expect(thesaurus).toEqual({
			word1: new Set(["synonym1"]),
		});
	});
});

describe("not enough columns", () => {
	const csvContent = "Term\nword1,word2";
	const separator: Separator = ",";
	it("should error", () => {
		expect(() =>
			getThesaurus(csvContent, separator, mockTranslation, columnNames)
		).toThrow(mockTranslation("error.csv.malformed"));
	});
});
