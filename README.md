# Tricky Addon - Update Target List
Configure Tricky Store target.txt with KSU WebUI.

> [!NOTE]
> *This module is **not** a part of the Tricky Store module. DO NOT report any issues to Tricky Store if encountered.*

## Requirements
- [Tricky store](https://github.com/5ec1cff/TrickyStore) module installed

## Instructions
### KernelSU & Apatch
- KSU WebUI

### Magisk (Action Button)
- action.sh will open WebUI, automatic install [KSUWebUIStandalone](https://github.com/5ec1cff/KsuWebUIStandalone) if not installed.

### Module Visibility
**Invisible:** Action/WebUI on the Tricky Store module card. Uninstall by pressing the uninstall button at the bottom part of WebUI.

**Visible:** For people having trouble with KSUWebUIStandalone, such as using an old version of Magisk that lacks the action button, KSU built-in WebUI crashes, etc.

### What This Module Do
| Feature | Status |
|:---|:---:|
| Configure target.txt with the app name for display | ✅ |
| Select apps from Magisk DenyList (optional) | ✅ |
| Set verifiedBootHash (optional) | ✅ |
| Provide AOSP Keybox (optional) | ✅ |
| Strong integrity (not guaranteed) | ❌ |
| Shamiko Whitelist switch (BIG NO) | ❌ |
| Add '!' or '?' to the target (Not needed) | ❌ |
| Periodically update the target and add new apps | ❌ |
| Add system apps (except GMS, added by default) | ❌ |

## Translation
- Read [Translation Guide](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/module/webroot/locales/A-translate.md)

## Acknowledgement
- [j-hc/zygisk-detach](https://github.com/j-hc/zygisk-detach) - KSU WebUI template

## Links
Download: [GitHub release](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases)

Update history: Read [Changelog](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/changelog.md)

Telegram channel: [KOW's Little World](https://t.me/kowchannel)
