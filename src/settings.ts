import { type App, PluginSettingTab, Setting } from "obsidian";
import MyThesaurus from "./main";

export class MyThesaurusSettingTab extends PluginSettingTab {
	plugin: MyThesaurus;

	constructor(app: App, plugin: MyThesaurus) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		
	}
}
