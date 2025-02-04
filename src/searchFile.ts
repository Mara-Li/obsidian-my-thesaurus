import i18next from "i18next";

import { AbstractInputSuggest, type App, Notice, TFile } from "obsidian";


export class FileSuggester extends AbstractInputSuggest<TFile> {
	constructor(
		private inputEl: HTMLInputElement,
		app: App,
		private onSubmit: (value: TFile) => void) {
			
		}
	)
}