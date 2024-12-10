# Translation Guide
## Fix Bad Translation
1. Fork this repository.
2. Find your language string file in `/module/webroot/locales/`.
3. Edit the string value with translated incorrectly.
4. Create a Pull Request.

---
## Add a New Language
### Simple
- Contact me in Telegram to add a new translation langauge.

### Advanced
1. Fork this repository.
2. Make a copy of `/module/webroot/locales/A-template.json`
3. Rename it to `language_code-COUNTRY_CODE.json`, e.g., `en-US.json`.
4. Translate the string value inside.
5. Add `langauge-option` into `/module/webroot/index.html`.

Format:
```xml
<button class="language-option" data-lang="language_code-COUNTRY_CODE">languageName</button>
```

Example:
```xml
<div class="language-menu">
    <button class="language-option" data-lang="en-US">English</button>
</div>
```
Finally, Create a Pull Request.