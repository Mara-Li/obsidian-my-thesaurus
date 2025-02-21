import type { ColumnName, Translation } from "../src/interfaces";

export const mockTranslation = ((key: string, options?: any) => {
	const translations: { [key: string]: string } = {
		"error.csv.columns": "Invalid column names",
		"error.csv.separator": `Invalid separator: ${options?.sep}`,
		"error.csv.header": `Invalid header length: ${options?.len}`,
		"error.csv.malformed": `Your CSV is malformed: there is no column.`,
	};
	return translations[key] || key;
}) as Translation;

export const columnNames: ColumnName = { term: "Term", synonyms: "Synonyms" };
