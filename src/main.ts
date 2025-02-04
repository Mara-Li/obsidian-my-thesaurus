import { Plugin } from "obsidian";
import { resources, translationLanguage } from "./i18n";
import i18next from "i18next";

import { MyThesaurusSettingTab } from "./settings";
import { MyThesaurusSettings, DEFAULT_SETTINGS } from "./interfaces";

export default class MyThesaurus extends Plugin {
	settings!: MyThesaurusSettings;

	async onload() {
		console.log(`[${this.manifest.name}] Loaded`)
		await this.loadSettings();
		//load i18next
		await i18next.init({
			lng: translationLanguage,
			fallbackLng: "en",
			resources,
			returnNull: false,
			returnEmptyString: false,
		});
		this.addSettingTab(new MyThesaurusSettingTab(this.app, this));
		
	}

	onunload() {
		console.log(`[${this.manifest.name}] Unloaded`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


