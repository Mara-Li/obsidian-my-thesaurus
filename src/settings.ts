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
import { verifCSV } from "./utils";

export class MyThesaurusSettingTab extends PluginSettingTab {
	plugin: MyThesaurus;
	settings: MyThesaurusSettings;

	constructor(app: App, plugin: MyThesaurus) {
		super(app, plugin);
		this.plugin = plugin;
		this.settings = plugin.settings;
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
					.addOption("\t", `\\t (${i18next.t("settings.separator.tab")})`)
					.addOption("|", "|")
					.setValue(this.settings.separator)
					.onChange(async (value) => {
						this.settings.separator = value as Separator;
						await this.plugin.saveSettings();
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

				new Setting(containerEl)
					.setHeading()
					.setName(i18next.t("settings.thesaurusPath.title"))
					.setDesc(i18next.t("settings.thesaurusPath.desc"))
					.addSearch(async (cb) => {
						cb.setPlaceholder(i18next.t("settings.thesaurusPath.placeholder"));
						cb.setValue(this.settings.thesaurusPath);
						new FileSuggester(cb.inputEl, this.app, async (result) => {
							this.settings.thesaurusPath = result.path;
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
									return;
								}
								const content = await this.app.vault.read(file);
								try {
									verifCSV(
										content,
										this.settings.separator,
										i18next.t,
										this.settings.columns
									);
								} catch (e) {
									new Notice((e as Error).message);
									this.settings.thesaurusPath = "";
									await this.plugin.saveSettings();
									this.display();
									return;
								}
								new Notice(i18next.t("settings.thesaurusPath.success"));
							});
					});
			});

		new Setting(containerEl)
			.setName(i18next.t("settings.excludedPath.title"))
			.setHeading()
			.setDesc(
				sanitizeHTMLToDom(
					`${i18next.t("settings.excludedPath.desc")}<br>${i18next.t("settings.excludedPath.separate")}<br>${i18next.t("settings.excludedPath.regex")}`
				)
			)
			.addTextArea((text) => {
				text.setValue(this.settings.excludedPath.join("\n")).onChange(async (value) => {
					this.settings.excludedPath = value.split(/[\n,; ]+/).map((path) => path.trim());
					await this.plugin.saveSettings();
				});
			});
	}
}
