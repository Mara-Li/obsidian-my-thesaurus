import { getHeader, getThesaurus } from "./parse_csv";
import { getTags } from "./parse_file";

export { getThesaurus, getTags, getHeader };

export function areArraysEqual<T>(arr1?: T[], arr2?: T[]): boolean {
	if ((arr1 && !arr2) || (!arr1 && arr2) || (!arr1 && !arr2)) return false;
	if (arr1 && arr2)
		return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);
	return false;
}
export function findMissingElements<T>(currentTags: T[], tags: T[]): T[] {
	const currentSet = new Set(currentTags);
	return tags.filter((tag) => !currentSet.has(tag));
}

export function getKeysAsArray(tag: string | string[]) {
	if (!Array.isArray(tag)) return [tag];
	return tag;
}
