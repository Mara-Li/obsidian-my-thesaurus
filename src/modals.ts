import i18next from "i18next";
import { type App, Modal, sanitizeHTMLToDom } from "obsidian";
import type { ParseResults } from "./interfaces";

export class ResultModals extends Modal {
	result: ParseResults;
	constructor(app: App, result: ParseResults) {
		super(app);
		this.result = result;
		this.setTitle(i18next.t("modal.title"));
		this.titleEl.addClasses(["my-thesaurus"]);
	}

	errorHtml(errors: ParseResults) {
		const errorsHtml = errors
			.map((e) => `<li><u>${e.file}</u>: ${e.errors}</li>`)
			.join("");
		return sanitizeHTMLToDom(`
		<h2 class="error">${i18next.t("modal.errors")}</h2><br>
		<ul>${errorsHtml}</ul>`);
	}

	skipHtml(skips: ParseResults) {
		const skipHtml = skips.map((s) => `<li><u>${s.file}</u></li>`).join("\n");
		return sanitizeHTMLToDom(`
		<h2 class="skip">${i18next.t("modal.skips")}</h2><br>
		<ul>${skipHtml}</ul>`);
	}

	successHtml(successes: ParseResults) {
		const successHtml = successes
			.map(
				(s) =>
					`<li><u><strong>${s.file}</strong></u><ul> ${s.tags.map((tag) => `<li><code>${tag}</code></li>`).join("\n")}</ul></li>`
			)
			.join("");
		return sanitizeHTMLToDom(`
		<h2 class="success">${i18next.t("modal.success")}</h2><br>
		<ul>${successHtml}</ul>`);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClasses(["my-thesaurus"]);

		const errors = this.result.filter((r) => r.type === "error");
		const successes = this.result.filter((r) => r.type === "success");
		const skips = this.result.filter((r) => r.type === "skip");

		contentEl.appendChild(this.errorHtml(errors));
		contentEl.appendChild(this.skipHtml(skips));
		contentEl.appendChild(this.successHtml(successes));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
