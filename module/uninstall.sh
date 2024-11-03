MODPATH=${0%/*}
SCRIPT_DIR="/data/adb/tricky_store"

# Remove residue and restore original keybox.
rm -rf "$SCRIPT_DIR/target_list_config"
rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
if [ -f "$MODPATH/common/origkeybox" ]; then
    rm -f "$SCRIPT_DIR/keybox.xml"
    mv "$MODPATH/common/origkeybox" "$SCRIPT_DIR/keybox.xml"
fi