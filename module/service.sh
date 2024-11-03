MODPATH=${0%/*}
TS="/data/adb/modules/tricky_store"
SCRIPT_DIR="/data/adb/tricky_store"

hash_value=$(grep -v '^#' "$MODPATH/boot_hash" | tr -d '[:space:]')
if [ -n "$hash_value" ]; then
    resetprop -n ro.boot.vbmeta.digest "$hash_value"
fi

if [ ! -f "$MODPATH/common/module.prop.orig" ]; then
    sed -i 's/^description=.*/description=Module is corrupted, please reinstall module./' "$MODPATH/module.prop"
    touch "$MODPATH/disable"
    exit 1
fi

if [ ! -d "$TS" ]; then
    sed -i 's/^description=.*/description=Tricky store is not installed/' "$MODPATH/module.prop"
    touch "$MODPATH/disable"
elif  [ -f "$TS/disable" ]; then
    sed -i 's/^description=.*/description=Tricky store is disabled/' "$MODPATH/module.prop"
    touch "$MODPATH/disable"
elif  [ ! -f "$SCRIPT_DIR/UpdateTargetList.sh" ]; then
    sed -i 's/^description=.*/description=Script missing, please install module again/' "$MODPATH/module.prop"
    touch "$MODPATH/disable"
else
    cat "$MODPATH/common/module.prop.orig" > "$MODPATH/module.prop"
    until [ "$(getprop sys.boot_completed)" = "1" ]; do
        sleep 1
    done
    . "$SCRIPT_DIR/UpdateTargetList.sh"
fi