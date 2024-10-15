MODDIR=${0%/*}
COMPATH="$MODDIR/common"
# Check pm command functionality
sleep 10
until pm list packages > /dev/null 2>&1; do
    sleep 1
done

# Check tricky store status
TS="/data/adb/modules/tricky_store"
if [ -f "$TS/disable" ]; then
    cat "$COMPATH/disabled" > "$MODDIR/module.prop"
elif  [ ! -d "$TS" ]; then
    cat "$COMPATH/ninstalled" > "$MODDIR/module.prop"
else
    cat "$COMPATH/normal" > "$MODDIR/module.prop"
    sh "$MODDIR"/common/UpdateTargetList.sh || true
fi