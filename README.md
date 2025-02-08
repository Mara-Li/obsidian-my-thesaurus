# My Thesaurus  

Automagically adds tags based on a thesaurus CSV.  

## ⚙️ Settings  

1. <ins>Separator</ins>: The separator used in the CSV file. Supported separators are `,`, `;`, `|`, and `tabulation`.  
2. <ins>Column title</ins>: The title of the column in the CSV file that contains the tags:  
    - **Term**: The column contains the tags that must be set by the plugin.  
    - **Synonyms**: The column contains the synonyms that must be recognized by the plugin.  
3. <ins>Thesaurus</ins>: Path to the file containing the thesaurus. The file must be a CSV file and must be in your vault. You can click on the `save` button to ensure the file is valid (the path is correct, the file exists, and it's well-formed).  

> [!WARNING]  
> If, for some reason, the file is moved, you need to update the path in the settings! It won't be updated automatically.  

5. <u>Included paths</u>: Files in these folders will be included when using the command `My Thesaurus: Parse all files`. You can separate the paths with a comma, semicolon, or newline. Moreover, regex is supported.  

> [!TIP]  
> You can include all the files in your vault by using `.*` as the path!  

## 📝 Usage  

The plugin has two commands:  

1. <ins>My Thesaurus: Parse all files</ins>: This command will parse all the files in the included paths and add the tags based on the thesaurus. At the end, a message will be displayed with the results, including:  
    - **Errors**: The files that encountered an error and the specific error message.  
    - **Skipped files**: The files that have been skipped because no synonym was found.  
    - **Success**: The files that have been successfully parsed, along with the tags that have been added.  
2. <ins>My Thesaurus: Parse current file</ins>: This command will parse the current file and add the tags based on the thesaurus.  

## 📥 Installation

- [ ] From Obsidian's community plugins
- [x] Using BRAT with `https://github.com/Mara-Li/`
- [x] From the release page: 
    - Download the latest release
    - Unzip `my-thesaurus.zip` in `.obsidian/plugins/` path
    - In Obsidian settings, reload the plugin
    - Enable the plugin


### 🎼 Languages

- [x] English
- [x] French

To add a translation:
1. Fork the repository
2. Add the translation in the `src/i18n/locales` folder with the name of the language (ex: `fr.json`). 
    - You can get your locale language from Obsidian using [obsidian translation](https://github.com/obsidianmd/obsidian-translations) or using the commands (in templater for example) : `<% tp.obsidian.moment.locale() %>`
    - Copy the content of the [`en.json`](./src/i18n/locales/en.json) file in the new file
    - Translate the content
3. Edit `i18n/i18next.ts` :
    - Add `import * as <lang> from "./locales/<lang>.json";`
    - Edit the `ressource` part with adding : `<lang> : {translation: <lang>}`

