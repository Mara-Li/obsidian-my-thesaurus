import i18next from "i18next";
import {
	type App,
	Notice,
	PluginSettingTab,
	Setting,
	TFile,
	sanitizeHTMLToDom,
} from "obsidian";
import type { MyThesaurusSettings, Separator } from "./interfaces";
import type MyThesaurus from "./main";
import { FileSuggester } from "./searchFile";
import { getThesaurus } from "./utils";

export class MyThesaurusSettingTab extends PluginSettingTab {
	plugin: MyThesaurus;
	settings: MyThesaurusSettings;
	isInvalid: boolean;

	constructor(app: App, plugin: MyThesaurus) {
		super(app, plugin);
		this.plugin = plugin;
		this.settings = plugin.settings;
		this.isInvalid = false;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.addClass("my-thesaurus");

		containerEl.empty();

		new Setting(containerEl)
			.setName(i18next.t("settings.separator.title"))
			.setDesc(i18next.t("settings.separator.desc"))
			.addDropdown((dropdown) => {
				dropdown
					.addOption(";", ";")
					.addOption(",", ",")
					.addOption("\t", `${i18next.t("settings.separator.tab")}`)
					.addOption("|", "|")
					.addOption("md", `${i18next.t("settings.separator.md")}`)
					.setValue(this.settings.separator)
					.onChange(async (value) => {
						this.settings.separator = value as Separator;
						await this.plugin.saveSettings();
						this.display();
					});
			});

		new Setting(containerEl).setName(i18next.t("settings.columns.title")).setHeading();

		new Setting(containerEl)
			.setName(i18next.t("settings.columns.term.title"))
			.setDesc(i18next.t("settings.columns.term.desc"))
			.addText((text) => {
				text.setValue(this.settings.columns.term).onChange(async (value) => {
					this.settings.columns.term = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName(i18next.t("settings.columns.synonyms.title"))
			.setDesc(i18next.t("settings.columns.synonyms.desc"))
			.addText((text) => {
				text.setValue(this.settings.columns.synonyms).onChange(async (value) => {
					this.settings.columns.synonyms = value;
					await this.plugin.saveSettings();
				});
			});

		const thesaurusSetting = new Setting(containerEl)
			.setHeading()
			.setName(i18next.t("settings.thesaurusPath.title"))
			.setDesc(i18next.t("settings.thesaurusPath.desc"))
			.addSearch(async (cb) => {
				cb.setPlaceholder(i18next.t("settings.thesaurusPath.placeholder"));
				cb.setValue(this.settings.thesaurusPath);
				const ext = this.settings.separator === "md" ? "md" : "csv";
				new FileSuggester(cb.inputEl, this.app, ext, async (result) => {
					this.settings.thesaurusPath = result.path;
					await this.plugin.saveSettings();
				});
				//clean when the cb.clear() is called
				cb.clearButtonEl.addEventListener("click", async () => {
					this.settings.thesaurusPath = "";
					await this.plugin.saveSettings();
				});
			})
			.addExtraButton((button) => {
				button
					.setIcon("save")
					.setTooltip(i18next.t("settings.thesaurusPath.verify"))
					.onClick(async () => {
						const file = this.app.vault.getAbstractFileByPath(
							this.settings.thesaurusPath
						);
						if (!(file instanceof TFile)) {
							new Notice(i18next.t("settings.thesaurusPath.error"));
							this.isInvalid = true;
							this.display();
							return;
						}
						const content = await this.plugin.readThesaurus();
						try {
							getThesaurus(
								content,
								this.settings.separator,
								i18next.t,
								this.settings.columns
							);
							this.isInvalid = false;
							this.display();
						} catch (e) {
							new Notice(
								sanitizeHTMLToDom(`<span class="error">${(e as Error).message}</span>`)
							);
							this.isInvalid = true;
							this.display();
							return;
						}
						new Notice(
							sanitizeHTMLToDom(
								`<span class="success">${i18next.t("settings.thesaurusPath.success")}</span>`
							)
						);
					});
			});
		if (this.isInvalid) thesaurusSetting.setClass("is-invalid");

		new Setting(containerEl)
			.setName(i18next.t("settings.includedPaths.title"))
			.setHeading()
			.setDesc(
				sanitizeHTMLToDom(
					`${i18next.t("settings.includedPaths.desc")}<br>${i18next.t("settings.includedPaths.separate")}<br>${i18next.t("settings.includedPaths.regex")}`
				)
			)
			.addTextArea((text) => {
				text.setValue(this.settings.includedPaths.join("\n")).onChange(async (value) => {
					this.settings.includedPaths = value
						.split(/[\n,;]+/)
						.map((path) => path.trim())
						.filter((path) => path.length > 0);
					await this.plugin.saveSettings();
				});
			});
	}
}
