MODDIR=${0%/*}
COMPATH="$MODDIR/common"
TS="/data/adb/modules/tricky_store"

if [ ! -d "$TS" ]; then
    cat "$COMPATH/ninstalled" > "$MODDIR/module.prop"
elif  [ -f "$TS/disable" ]; then
    cat "$COMPATH/disabled" > "$MODDIR/module.prop"
else
    cat "$COMPATH/normal" > "$MODDIR/module.prop"
    until [ "$(getprop sys.boot_completed)" = "1" ]; do
        sleep 1
    done
    . "$COMPATH/common/UpdateTargetList.sh"
fi