import i18next from "i18next";
import { Notice, Plugin, TFile, sanitizeHTMLToDom } from "obsidian";
import { resources, translationLanguage } from "./i18n";
import {
	DEFAULT_SETTINGS,
	type MyThesaurusSettings,
	type ParseResult,
	type ParseResults,
	type Thesaurus,
} from "./interfaces";
import { MyThesaurusSettingTab } from "./settings";
import "uniformize";
import { ResultModals } from "./modals";
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

	async parseFile(
		file: TFile,
		silent = false,
		thesaurus: Thesaurus
	): Promise<ParseResult> {
		const contents = await this.app.vault.read(file);

		if (contents.length === 0) {
			this.notice(i18next.t("error.file.empty", { file: file.name }), silent);
			return {
				file: file.basename,
				tags: [],
				errors: i18next.t("error.file.empty", { file: file.name }),
				type: "skip",
			};
		}
		try {
			const tags = getTags(contents, thesaurus);
			if (tags.length > 0) {
				await this.addTagsToNote(tags, file);
				const successMsg = sanitizeHTMLToDom(
					`<span class="success">${i18next.t("success.title")}</span>${tags.map((tag) => `<li><code>${tag}</code></li>`).join("")}`
				);
				this.notice(successMsg, silent);
				return {
					file: file.basename,
					tags: tags,
					type: "success",
				};
			} else {
				this.notice(i18next.t("success.none"), silent);
				return {
					file: file.basename,
					tags: [],
					type: "skip",
				};
			}
		} catch (error) {
			this.notice(
				sanitizeHTMLToDom(`<span class="errors">${(error as Error).message}</span>`),
				silent
			);
			return {
				file: file.basename,
				tags: [],
				errors: (error as Error).message,
				type: "error",
			};
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

	scanAllFiles(): TFile[] {
		const allMarkdownFiles = this.app.vault.getMarkdownFiles();
		console.log(allMarkdownFiles);
		const files = [];
		for (const filter of this.settings.includedPaths) {
			try {
				const regex = new RegExp(filter, "g");
				console.log(regex);
				files.push(...allMarkdownFiles.filter((file) => file.path.match(regex)));
			} catch (error) {
				console.error(error);
				//try with normal match
				files.push(...allMarkdownFiles.filter((file) => file.path.includes(filter)));
			}
		}
		//remove duplicate
		console.log(files);
		return [...new Set(files)];
	}

	async thesaurusAllFiles() {
		if (this.settings.includedPaths.length === 0) {
			this.notice(
				sanitizeHTMLToDom(`<span class="error">${i18next.t("error.noPaths")}</span>`),
				false
			);
			return;
		}
		const toParse = this.scanAllFiles();
		if (toParse.length === 0) {
			this.notice(i18next.t("error.noFiles"), true);
			return;
		}
		const thesaurus = getThesaurus(
			await this.readThesaurus(),
			this.settings.separator,
			i18next.t,
			this.settings.columns
		);
		const results: ParseResults = [];
		const noticeBar = new Notice(
			`📤 ${i18next.t("notice.loading")} 0/${toParse.length}`,
			0
		);

		let progress = 0;
		for (const file of toParse) {
			results.push(await this.parseFile(file, true, thesaurus));
			progress++;
			noticeBar.setMessage(
				`📤 ${i18next.t("notice.loading")} ${progress}/${toParse.length}`
			);
			// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
			await sleep(100);
		}
		noticeBar.setMessage(
			sanitizeHTMLToDom(`<span class="success">📤 ${i18next.t("notice.done")}</span>`)
		);
		new ResultModals(this.app, results).open();
		// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
		await sleep(5000);
		noticeBar.hide();
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
		this.addCommand({
			id: "parse-all",
			name: i18next.t("command.all"),
			callback: () => {
				this.thesaurusAllFiles();
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
