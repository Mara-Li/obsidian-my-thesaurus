import type { ColumnName, Separator, Thesaurus, Translation } from "../interfaces";

function verifySeparator(header: string, sep: Separator): boolean {
	return header.includes(sep);
}

function searchSeparator(header: string): Separator {
	return header.match(/[,;\t\|]/)?.[0] as Separator;
}

function getColumn(
	header: string[],
	columnNames: ColumnName,
	ln: Translation
): { indexKey: number; indexSynonyms: number } {
	const col1 = header[0].trim().standardize();
	const col2 = header[1].trim().standardize();
	let indexKey = 1;
	let indexSynonyms = 0;
	const standardized = structuredClone(columnNames);
	standardized.term = standardized.term.standardize();
	standardized.synonyms = standardized.synonyms.standardize();
	if (
		(col1 !== standardized.term && col1 !== standardized.synonyms) ||
		(col2 !== standardized.term && col2 !== standardized.synonyms)
	) {
		throw new Error(ln("error.csv.columns"));
	}
	if (col1 === standardized.term) {
		indexKey = 0;
		indexSynonyms = 1;
	}
	return { indexKey, indexSynonyms };
}

export function getHeader(fileContent: string[], separator: Separator, ln: Translation) {
	const header = fileContent[0]
		.split(separator)
		.filter((col) => col.trim() !== "")
		.map((col) => col.trim());
	if (header.length !== 2) {
		throw new Error(ln("error.csv.header", { len: header.length }));
	}
	return header;
}

export function getThesaurus(
	fileContent: string,
	separator: Separator,
	ln: Translation,
	columnNames: ColumnName,
	standardize?: boolean
) {
	//verify if they are only two columns
	const isMd = separator === "md";
	separator = isMd ? "|" : separator;
	const lines = fileContent.split("\n");
	if (!verifySeparator(lines[0], separator))
		throw new Error(ln("error.csv.separator", { sep: searchSeparator(lines[0]) }));

	const header = getHeader(lines, separator, ln);
	if (header.length !== 2) {
		throw new Error(ln("error.csv.header", { len: header.length }));
	}
	const { indexKey, indexSynonyms } = getColumn(header, columnNames, ln);
	const thesaurus: Thesaurus = {};
	const lineSlice = isMd ? 2 : 1;
	for (const line of lines.slice(lineSlice).filter((line) => line.trim() !== "")) {
		const columns = line.split(separator).filter((col) => col.trim() !== "");

		if (columns.length > 0 && columns.length !== 2)
			throw new Error(ln("error.csv.malformed", { len: columns.length }));

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
