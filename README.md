# **Tricky Addon - Update Target List**
An addon module for tricky store

---
## Description
- Automated script to update tricky store target list.
- System app excluded by default
- This is **not** a necessary module for root hide but for those who lazy to do it manually

## Requirements
- [Tricky store](https://github.com/5ec1cff/TrickyStore) module installed

## Custom Configuration
- ADDITION and EXCLUDE in `/data/adb/tricky_store/target_list_config`
- EXCLUDE for removing unnecessary apps
- ADDITION for adding back system app excluded by default
- Configuration list with **KSU WebUI** (For KernelSU and Apatch, )

## Instructions
### Automatic update
- On boot

### Manually update
**Action button method**
- Use action button to update tricky store target list.
- Available for Magisk 27008+, KernelSU 11981+, Apatch 10927+

**Manual script method**
- Run `UpdateTargetList.sh` under `/data/adb/tricky_store` manually.
- MT manager is recommened for this method

## More
**Support to pass abnormal boot state**
- Put Verfied Boot Hash to `boot_hash` in `/data/adb/modules/TA_utl`, reboot.

## Acknowledgement
- [j-hc/zygisk-detach](https://github.com/j-hc/zygisk-detach) - KSU WebUI template

## Links
Download: [GitHub release](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases)

Telegram channel: [KOW's Little World](https://t.me/kowchannel)
