### Tricky Addon: Update Target List
A **KSU WebUI** to configure tricky store target.txt

Requirement: Tricky Store module installed

This module is not a part of Tricky Store, DO NOT report to Tricky Store if you encounter any issue.

GitHub release: [Tricky Addon: Update Target List](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/latest)

Telegram channel: [KOW's Little World](https://t.me/kowchannel)

## Changelog
### v2.6-beta.2
- Due to extensive code refactoring, you might encounter unexpected bugs in this version, feedback in [Telegram](https://t.me/kowchannel) or [create issue](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/issues) if you found any issue.
- This module now invisible, use shortcut on Tricky Store module. To uninstall module, scroll down to the botttom of WebUI and press Uninstall WebUI.
- Compatiple with Tricky Store 1.2.0. Tested on Magisk Alpha 28001, Apatch Next 11010, KernelSU 11895.
- Fixed some UI bug.

### v2.6-beta.1
- Check in [release notes](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v2.6-beta.1).

### v2.5
- Remove kb prompt on installation, moved into WebUI
- Restore to AOSP keybox during uninstallation

### v2.4
- Added aapt binary for app name display

**KSU WebUI**
- Added app name display

### v2.3
- Removed curl binary
- Moved boot_hash to /data/adb to prevent overwrite
- Stop TSP-A auto target to prevent overwrite
- Abandoned action button in KernelSU and Apatch
- Magisk action button: open WebUI, automatic download if not installed (optional)

**KSU WebUI**
- Option to select app from DenyList (Magisk)

### v2.2
**KSU WebUI:**
- Added help menu
- Added extra [unnecessary app](https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/master/more-excldue.json) exclude option
- Added no Internet connection prompt

### v2.1
- Added curl binary to fetch Xposed module package name from LSPosed webside

- **KSU WebUI:**
- Added feature to exclude Xposed module package name
- Fixed abnormal color in dark mode
- Combined save config and update target.txt button
- Fixed some more known bugs

### v2.0
- Added WebUI for configuration

### v1.7
- Fixed update issue (Will start to work in next update)

### v1.6
- Updated something

### v1.5
- Fixed some known issue
- Updated something

### v1.4.1
- Fixed Magisk installation issue

### v1.4
- Migrate ro.boot.vbmeta.digest from system.prop to resetprop
- Fix config list recognize error on some device
- Refactor code

### v1.3.1
- Added Apatch Next package name to exclude list
- Fix automatic update target script not working issue

### v1.3
- Minor improvement in code
- Overwrite protection: won't remove previous setup when updating module

### v1.2
- Initial release
- Automated update target list on every boot

### v1.1
- Add exclution and addition list config, config directory: /data/adb/tricky_store/target_list_config (No release)

### v1.0
- Initial version (No release)
