import type { ColumnName, Separator, Thesaurus, Translation } from "../interfaces";

function verifySeparator(header: string, sep: Separator): boolean {
	return header.includes(sep);
}

function searchSeparator(header: string): Separator {
	return header.match(/[,;\t\|]/)?.[0] as Separator;
}

export function getColumn(
	header: string[],
	columnNames: ColumnName,
	ln: Translation
): { indexKey: number; indexSynonyms: number } {
	const standardized = structuredClone(columnNames);
	standardized.term = standardized.term.standardize();
	standardized.synonyms = standardized.synonyms.standardize();
	const indexSynonyms = header.findIndex(
		(x) => x.standardize() === standardized.synonyms
	);
	const indexKey = header.findIndex((x) => x.standardize() === standardized.term);
	if (indexKey === -1 || indexSynonyms === -1) throw new Error(ln("error.csv.columns"));
	return { indexKey, indexSynonyms };
}

export function getHeader(fileContent: string[], separator: Separator) {
	return fileContent[0]
		.split(separator)
		.filter((col) => col.trim() !== "")
		.map((col) => col.trim());
}

export function getThesaurus(
	fileContent: string,
	separator: Separator,
	ln: Translation,
	columnNames: ColumnName,
	standardize?: boolean
) {
	if (fileContent.trim().length === 0) throw new Error(ln("error.csv.malformed"));

	const isMd = separator === "md";
	separator = isMd ? "|" : separator;
	const lines = fileContent.split("\n");
	if (!verifySeparator(lines[0], separator))
		throw new Error(ln("error.csv.separator", { sep: searchSeparator(lines[0]) }));

	const header = getHeader(lines, separator);
	const { indexKey, indexSynonyms } = getColumn(header, columnNames, ln);
	const thesaurus: Thesaurus = {};
	const lineSlice = isMd ? 2 : 1;
	for (const line of lines.slice(lineSlice).filter((line) => line.trim() !== "")) {
		const columns = line.split(separator).filter((col) => col.trim() !== "");

		const key = columns[indexKey].trim();
		let synonyms = columns[indexSynonyms].trim();
		if (standardize) synonyms = synonyms.standardize();
		if (key !== "" && synonyms !== "") {
			if (thesaurus[key] === undefined) thesaurus[key] = new Set();
			thesaurus[key].add(synonyms);
		}
	}
	return thesaurus;
}
