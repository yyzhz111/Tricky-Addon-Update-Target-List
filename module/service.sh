MODDIR=${0%/*}
COMPATH="$MODDIR/common"
TS="/data/adb/modules/tricky_store"

hash_value=$(grep -v '^#' "$MODDIR/boot_hash" | tr -d '[:space:]')
if [ -n "$hash_value" ]; then
    resetprop -n ro.boot.vbmeta.digest "$hash_value"
fi

if [ ! -f "$COMPATH/ninstalled" ] || [ ! -f "$COMPATH/disabled" ] || [ ! -f "$COMPATH/normal" ]; then
    sed -i 's/^description=.*/description=Module is corrupted, please reinstall module./' "$MODDIR/module.prop"
    exit 1
fi

if [ ! -d "$TS" ]; then
    cat "$COMPATH/ninstalled" > "$MODDIR/module.prop"
elif  [ -f "$TS/disable" ]; then
    cat "$COMPATH/disabled" > "$MODDIR/module.prop"
else
    cat "$COMPATH/normal" > "$MODDIR/module.prop"
    until [ "$(getprop sys.boot_completed)" = "1" ]; do
        sleep 1
    done
    . "$COMPATH/UpdateTargetList.sh"
fi