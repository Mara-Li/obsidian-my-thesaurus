import { describe, expect, it } from "bun:test";
import type { Thesaurus } from "../src/interfaces";
import { getTags } from "../src/utils";

describe("getTags", () => {
	it("should return an empty array if no tags are found", () => {
		const content = "This is a test content without any tags.";
		const thesaurus: Thesaurus = {
			tag1: new Set(["synonym1", "synonym2"]),
			tag2: new Set(["synonym3", "synonym4"]),
		};

		const result = getTags(content, thesaurus);
		expect(result).toEqual([]);
	});

	it("should return tags if synonyms are found in the content", () => {
		const content = "This content contains synonym1 and synonym4.";
		const thesaurus: Thesaurus = {
			tag1: new Set(["synonym1", "synonym2"]),
			tag2: new Set(["synonym3", "synonym4"]),
		};

		const result = getTags(content, thesaurus);
		expect(result).toEqual(["tag1", "tag2"]);
	});

	it("should handle case insensitive matches", () => {
		const content = "This content contains Synonym1 and SYNONYM4.";
		const thesaurus: Thesaurus = {
			tag1: new Set(["synonym1", "synonym2"]),
			tag2: new Set(["synonym3", "synonym4"]),
		};

		const result = getTags(content, thesaurus);
		expect(result).toEqual(["tag1", "tag2"]);
	});

	it("should not return duplicate tags", () => {
		const content = "This content contains synonym1 and synonym1 again.";
		const thesaurus: Thesaurus = {
			tag1: new Set(["synonym1", "synonym2"]),
			tag2: new Set(["synonym3", "synonym4"]),
		};

		const result = getTags(content, thesaurus);
		expect(result).toEqual(["tag1"]);
	});

	it("should return the two tags related to the synonyms", () => {
		const content = "This content contains synonym4.";
		const thesaurus: Thesaurus = {
			tag1: new Set(["synonym1", "synonym4"]),
			tag2: new Set(["synonym3", "synonym4"]),
		};

		const result = getTags(content, thesaurus);
		expect(result).toEqual(["tag1", "tag2"]);
	});
});
