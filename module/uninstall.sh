MODPATH=${0%/*}
TS="/data/adb/tricky_store"
# Remove residue and restore original keybox.
rm -rf "$TS/target_list_config"
rm -f "$TS/UpdateTargetList.sh"
if [ -f "$MODPATH/common/origkeybox" ]; then
    rm -f "$TS/keybox.xml"
    mv "$MODPATH/common/origkeybox" "$TS/keybox.xml"
fi