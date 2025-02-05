import type { Thesaurus } from "../interfaces";

export function getTags(content: string, thesaurus: Thesaurus) {
	const tagsToAdd: string[] = [];

	for (const tags of Object.keys(thesaurus)) {
		const synonyms = thesaurus[tags];
		const regex = new RegExp(`\\b(${[...synonyms].join("|")})\\b`, "gi");
		if (regex.test(content)) {
			tagsToAdd.push(tags);
		}
	}
	return tagsToAdd;
}
