import i18next from "i18next";
import {
	type FrontMatterCache,
	Notice,
	Plugin,
	TFile,
	getFrontMatterInfo,
	sanitizeHTMLToDom,
} from "obsidian";
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
import {
	areArraysEqual,
	findMissingElements,
	getKeysAsArray,
	getTags,
	getThesaurus,
} from "./utils";

export default class MyThesaurus extends Plugin {
	settings!: MyThesaurusSettings;

	getFileTags(frontmatter: FrontMatterCache) {
		const tags = [];
		if (frontmatter.tags) tags.push(...getKeysAsArray(frontmatter.tags));
		if (frontmatter.tag) tags.push(...getKeysAsArray(frontmatter.tag));
		return this.filterTerm(frontmatter, new Set(tags));
	}

	filterTerm(frontmatter: FrontMatterCache, tags: Set<string>) {
		const keyToFind = this.settings.excludeTermKey;
		if (keyToFind.trim().length === 0) return [...tags];
		if (frontmatter[keyToFind]) {
			const excludeList = getKeysAsArray(frontmatter[keyToFind]);
			for (const tag of excludeList) tags.delete(tag);
		}
		return [...tags];
	}

	async addTagsToNote(
		tags: string[],
		file: TFile,
		currentTags: string[]
	): Promise<boolean> {
		if (areArraysEqual(tags, currentTags)) return false;
		const newTags = [...new Set([...currentTags, ...tags])];
		if (newTags.length === 0) return false;
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			if (frontmatter.tag) frontmatter.tag = newTags;
			else frontmatter.tags = newTags;
		});
		return true;
	}

	notice(message: string | DocumentFragment, silent = false) {
		if (!silent) new Notice(message);
	}

	skip(file: TFile, silent = false): ParseResult {
		this.notice(i18next.t("success.none"), silent);
		return {
			file: file.basename,
			tags: [],
			type: "skip",
		};
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
			const tags = getTags(contents, thesaurus, this.settings.removeAccents).concat(
				...getTags(file.basename, thesaurus, this.settings.removeAccents)
			);
			if (tags.length > 0) {
				const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter || {};
				const currentTags = this.getFileTags(frontmatter);
				const added = await this.addTagsToNote(tags, file, currentTags);
				if (added) {
					const missingTags = findMissingElements(currentTags, tags);
					const successMsg = sanitizeHTMLToDom(
						`<span class="success">${i18next.t("success.title")}</span>${missingTags.map((tag) => `<li><code>${tag}</code></li>`).join("")}`
					);
					this.notice(successMsg, silent);
					return {
						file: file.basename,
						tags: tags,
						type: "success",
					};
				} else return this.skip(file, silent);
			} else return this.skip(file, silent);
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
		if (this.settings.thesaurusPath.length === 0)
			throw new Error(i18next.t("error.noPath"));
		const thesaurusFile = this.app.vault.getAbstractFileByPath(
			this.settings.thesaurusPath
		);
		const ext = this.settings.separator === "md" ? "md" : "csv";
		if (
			!thesaurusFile ||
			!(thesaurusFile instanceof TFile) ||
			thesaurusFile.extension !== ext
		) {
			throw new Error(i18next.t("error.notFound"));
		}
		let contents = await this.app.vault.read(thesaurusFile);
		if (ext === "md") {
			contents = contents.replace(/^\s*\n/gm, "");
			//remove the frontmatter
			const frontmatterInfo = getFrontMatterInfo(contents);

			if (frontmatterInfo.exists) return contents.slice(frontmatterInfo.contentStart);
			return contents;
		}
		return contents;
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
			this.settings.columns,
			this.settings.removeAccents
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
									this.settings.columns,
									this.settings.removeAccents
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
