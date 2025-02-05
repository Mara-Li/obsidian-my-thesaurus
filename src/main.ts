import i18next from "i18next";
import { Notice, Plugin, type TFile, sanitizeHTMLToDom } from "obsidian";
import { resources, translationLanguage } from "./i18n";

import { DEFAULT_SETTINGS, type MyThesaurusSettings } from "./interfaces";
import { MyThesaurusSettingTab } from "./settings";
import "uniformize";
import { getTags, getThesaurus } from "./utils";

export default class MyThesaurus extends Plugin {
	settings!: MyThesaurusSettings;

	async addTagsToNote(tags: string[], file: TFile) {
		const currentTags = this.app.metadataCache.getFileCache(file)?.tags || [];
		const newTags = [...new Set([...currentTags, ...tags])];
		if (newTags.length === 0) return;
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter.tags = newTags;
		});
	}

	async parseFile(file: TFile) {
		const contents = await this.app.vault.read(file);
		const thesaurusFile = this.app.vault.getAbstractFileByPath(
			this.settings.thesaurusPath
		) as TFile;
		const thesaurusContents = await this.app.vault.read(thesaurusFile);
		if (contents.length === 0) {
			new Notice(i18next.t("error.file.empty", { file: file.name }));
		}
		try {
			const thesaurus = getThesaurus(
				thesaurusContents,
				this.settings.separator,
				i18next.t,
				this.settings.columns
			);
			const tags = getTags(contents, thesaurus);
			if (tags.length > 0) {
				await this.addTagsToNote(tags, file);
				const successMsg = sanitizeHTMLToDom(
					`<p>${i18next.t("success.title")}</p><ul>${tags.map((tag) => `<li>${tag}</li>`)}</ul>`
				);
				new Notice(successMsg);
			} else {
				new Notice(i18next.t("success.none"));
			}
		} catch (error) {
			new Notice((error as Error).message);
		}
	}

	async onload() {
		console.log(`[${this.manifest.name}] Loaded`);
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
		this.addCommand({
			id: "parse-file",
			name: i18next.t("command.active"),
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (file && file.extension == "md") {
					if (!checking) {
						this.parseFile(file);
					}
					return true;
				}
				return false;
			},
		});
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
