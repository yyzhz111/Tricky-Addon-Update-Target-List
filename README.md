# Tricky Addon - Update Target List
Configure Tricky Store target.txt with KSU WebUI.

[![Latest Release](https://img.shields.io/github/v/release/KOWX712/Tricky-Addon-Update-Target-List?label=Release&logo=github)](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/latest)
[![Nightly Release](https://img.shields.io/badge/Nightly%20release-gray?logo=hackthebox&logoColor=eee)](https://nightly.link/KOWX712/Tricky-Addon-Update-Target-List/workflows/build/main?status=completed)

> [!WARNING]
> This module is **not** a part of the Tricky Store module. DO NOT report any issues to Tricky Store if encountered.

## Requirements
- [Tricky store](https://github.com/5ec1cff/TrickyStore) module installed

## Instructions
### KernelSU & Apatch
- KSU WebUI

### Magisk
- Action button to open WebUI
- Support KSUWebUIStandalone and latest MMRL
- Automatic install [KSUWebUIStandalone](https://github.com/5ec1cff/KsuWebUIStandalone) if none of them are installed.

### Module Visibility
| Visibility | Behavior|
| :--- | :--- |
| Invisible | <li>Action/WebUI on the Tricky Store module card.</li><li>Uninstall by pressing the uninstall button at the bottom part of WebUI.</li> |
| Visible | <li>For those who having trouble with KSUWebUIStandalone, such as</li><ul><li>using an old version of Magisk that lacks the action button</li><li>KSU built-in WebUI freeze</li></ul> |

### What Can This Module Do
| Feature | Status |
|:---|:---:|
| Configure target.txt with app name display | ✅ |
| Select apps from Magisk DenyList (optional) | ✅ |
| Deselect [unnecessary apps](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/more-excldue.json) (optional) | ✅ |
| Set verifiedBootHash (optional) | ✅ |
| Provide AOSP Keybox (optional) | ✅ |
| Valid Keybox (not guaranteed) | ❌ |
| Shamiko Whitelist switch ([Why?](https://github.com/rushizgithub/shamiko?tab=readme-ov-file#whitelist)) | ❌ |
| Add `!` or `?` to the target ([Not needed](https://github.com/5ec1cff/TrickyStore/releases/tag/1.1.0)) | ❌ |
| Periodically update target and add new apps | ❌ |
| Add system apps (GMS added by default) | ❌ |

## Translation
- Read [Translation Guide](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/module/webui/locales/A-translate.md)

## Acknowledgement
- [j-hc/zygisk-detach](https://github.com/j-hc/zygisk-detach) - KSU WebUI template

## Links
Download: [GitHub release](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases)

Update history: Read [Changelog](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/main/changelog.md)

Telegram channel: [KOW's Little World](https://t.me/kowchannel)
