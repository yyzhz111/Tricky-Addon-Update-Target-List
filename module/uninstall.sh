MODDIR="/data/adb/tricky_store"
# Remove residue and restore original keybox.
MODPATH=${0%/*}
rm -rf "$MODDIR/target_list_config"
rm -f "$MODDIR/UpdateTargetList.sh"
if [ -f "$MODPATH/common/origkeybox" ]; then
    rm -f "$MODDIR/keybox.xml"
    mv "$MODPATH/common/origkeybox" "$MODDIR/keybox.xml"
fi