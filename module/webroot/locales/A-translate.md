# Translation Guide
## Fix Translation Error
1. Fork this repository.
2. Find your language string file in `/module/webroot/locales/`.
3. Edit the string value with translated incorrectly.
4. Create a Pull Request.

---
## Add a New Language
### Simple
- Contact me in Telegram to add a new translation langauge for you.

### Advanced
1. Fork this repository.
2. Rename `/module/webroot/locales/A-template.json` to `language_code-COUNTRY_CODE.json`, e.g., `en-US.json`.
3. Translate the string value inside.
4. Add `langauge-option` into `/module/webroot/index.html`.
Format:
```xml
<button class="language-option" data-lang="language_code-COUNTRY_CODE" data-i18n="language_languageName">languageName</button>
```
Example:
```xml
<div class="language-menu">
    <button class="language-option" data-lang="en-US" data-i18n="language_english_us">English</button>
</div>
```
5. Add language_code-COUNTRY_CODE in `/module/webroot/index.js` under `function detectUserLanguage()`
Format:
```js
function detectUserLanguage() {
    const availableLanguages = ['en-US', 'ru-RU', 'tl-PH', 'zh-CN', 'zh-TW'];
}
```
6. Create a Pull Request