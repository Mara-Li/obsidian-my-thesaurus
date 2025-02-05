import i18next from "i18next";
import { Notice, Plugin, TFile, sanitizeHTMLToDom } from "obsidian";
import { resources, translationLanguage } from "./i18n";
import { DEFAULT_SETTINGS, type MyThesaurusSettings, type Thesaurus } from "./interfaces";
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

	notice(message: string | DocumentFragment, silent = false) {
		if (!silent) {
			new Notice(message);
		}
	}

	async parseFile(file: TFile, silent = false, thesaurus: Thesaurus) {
		const contents = await this.app.vault.read(file);
		const results = [];

		if (contents.length === 0) {
			this.notice(i18next.t("error.file.empty", { file: file.name }), silent);
			results.push({
				file: file.name,
				tags: [],
				error: i18next.t("error.file.empty", { file: file.name }),
			});
		}
		try {
			const tags = getTags(contents, thesaurus);
			if (tags.length > 0) {
				await this.addTagsToNote(tags, file);
				const successMsg = sanitizeHTMLToDom(
					`<p>${i18next.t("success.title")}</p>${tags.map((tag) => `<li><code>${tag}</code></li>`).join("")}`
				);
				this.notice(successMsg, silent);
				results.push({
					file: file.name,
					tags: tags,
				});
			} else {
				this.notice(i18next.t("success.none"), silent);
				results.push({
					file: file.name,
					tags: [],
				});
			}
		} catch (error) {
			this.notice((error as Error).message, silent);
			results.push({
				file: file.name,
				tags: [],
				error: (error as Error).message,
			});
		}
	}

	async readThesaurus() {
		const thesaurusFile = this.app.vault.getAbstractFileByPath(
			this.settings.thesaurusPath
		);
		if (
			!thesaurusFile ||
			!(thesaurusFile instanceof TFile) ||
			thesaurusFile.extension !== "csv"
		) {
			throw new Error(i18next.t("error.notFound"));
		}
		return await this.app.vault.read(thesaurusFile);
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
						this.readThesaurus()
							.catch((error) => {
								this.notice(error.message);
								return "";
							})
							.then((thesaurusContent) => {
								const thesaurus = getThesaurus(
									thesaurusContent,
									this.settings.separator,
									i18next.t,
									this.settings.columns
								);
								this.parseFile(file, false, thesaurus);
							});
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
