

export interface MyThesaurusSettings {
	thesaurusPath: string;
	excludedPath: string[];
}

export const DEFAULT_SETTINGS: MyThesaurusSettings = {
	thesaurusPath: "",
	excludedPath: []
};
