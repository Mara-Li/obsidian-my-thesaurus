import { AbstractInputSuggest, type App, type TFile } from "obsidian";

export class FileSuggester extends AbstractInputSuggest<TFile> {
	constructor(
		private inputEl: HTMLInputElement,
		app: App,
		private onSubmit: (value: TFile) => void
	) {
		super(app, inputEl);
	}

	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.setText(value.path);
	}

	getSuggestions(query: string): TFile[] {
		const allFiles = this.app.vault.getFiles().filter((file) => file.extension === "csv");
		return allFiles.filter((file) => file.path.subText(query));
	}

	selectSuggestion(value: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.onSubmit(value);
		this.inputEl.value = value.path;
		this.inputEl.focus();
		this.inputEl.trigger("input");
		this.close();
	}
}
