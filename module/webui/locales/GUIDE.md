# Translation Guide

## Update Existing Language

1. [Fork this repository](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/fork).
2. Find your language string file in `module/webui/locales/strings`.
3. Edit the string value that translated incorrectly or add missing translation field.
4. Make a Pull Request.

---

## Add a New Language

### Simple

- Contact me in Telegram to add a new translation langauge.

### Advanced

1. [Fork this repository](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/fork).
2. Copy `module/webui/locales/template.xml` to strings folder.
3. Rename it to `language_code.xml` or `language_code-REGION_CODE.xml`, e.g., `en.xml` or `zh-CN.xml`.
4. Translate the string value inside.
5. Add the language to `module/webui/locales/languages.json`, this step is necessary for displaying your language in WebUI.
6. Make a Pull Request.
