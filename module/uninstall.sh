MODPATH=${0%/*}
SCRIPT_DIR="/data/adb/tricky_store"

# Enable back TSupport-A auto update
if [ -f "/storage/emulated/0/stop-tspa-auto-target" ]; then
    rm -f "/storage/emulated/0/stop-tspa-auto-target"
fi

# Remove residue and restore aosp keybox.
rm -rf "$SCRIPT_DIR/target_list_config"
rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
rm -f "/data/adb/boot_hash"
xxd -r -p "$MODPATH/common/.default" | base64 -d > "$SCRIPT_DIR/keybox.xml"
