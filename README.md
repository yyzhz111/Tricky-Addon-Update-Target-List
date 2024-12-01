# Tricky Addon - Update Target List
Configure Tricky Store target.txt with KSU WebUI.

*This module is **not** a part of Tricky Store module, DO NOT report to Tricky Store if you encounter any issue.*

## Requirements
- [Tricky store](https://github.com/5ec1cff/TrickyStore) module installed

## Instructions
### KernelSU & Apatch
- KSU WebUI

### Magisk (Action Button)
- action.sh will open WebUI, automatic install [KSUWebUIStandalone](https://github.com/5ec1cff/KsuWebUIStandalone) if not installed.

### Module Visibility
- Invisible, action/WebUI on Tricky Store module card, uninstall by pressing uninstall button at the bottom part of WebUI.
- Visible, for people have trouble with KSUWebUIStandalone, like using old version Magisk which has no action button, KSU built-in WebUI crash etc.

### What This Module Do
- Configure target.txt with app name display ✅
- Option to select from Magisk DenyList ✅
- Set verifiedBootHash (optional) ✅
- Provide AOSP Keybox (optional) ✅
- Strong integrity (I never promise it) ❌
- Shamiko Whitelist switch (BIG NO) ❌
- Add '!' or '?' to target ([Not needed](https://github.com/5ec1cff/TrickyStore/releases/tag/1.1.0)) ❌
- Periodicly update target and add new app ❌
- Add system app ❌ (but GMS added by default)

## Translation
- Read [Translation Guide](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/module/webroot/locales/A-translate.md)

## Acknowledgement
- [j-hc/zygisk-detach](https://github.com/j-hc/zygisk-detach) - KSU WebUI template

## Links
Download: [GitHub release](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases)

Update history: Read [Changelog](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/changelog.md)

Telegram channel: [KOW's Little World](https://t.me/kowchannel)
