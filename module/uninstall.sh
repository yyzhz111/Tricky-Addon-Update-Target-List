MODPATH=${0%/*}
SCRIPT_DIR="/data/adb/tricky_store"

# Enable back TSupport-A auto update
if [ -f "/storage/emulated/0/stop-tspa-auto-target" ]; then
    rm -f "/storage/emulated/0/stop-tspa-auto-target"
fi

# Remove residue and restore original keybox.
rm -rf "$SCRIPT_DIR/target_list_config"
rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
rm -f "/data/adb/boot_hash"
if [ -f "$MODPATH/common/origkeybox" ]; then
    rm -f "$SCRIPT_DIR/keybox.xml"
    mv "$MODPATH/common/origkeybox" "$SCRIPT_DIR/keybox.xml"
fi