MODPATH=${0%/*}
TS="/data/adb/modules/tricky_store"

while [ -z "$(ls -A /data/adb/modules/)" ]; do
    sleep 1
done

if [ ! -d "$TS" ] || [ -f "$TS/remove" ]; then
    if [ -d "$MODPATH/common/temp" ]; then
        mkdir -p "/data/adb/modules/TA_utl"
        cp -rf "$MODPATH/common/temp"/* "/data/adb/modules/TA_utl/"
        touch "/data/adb/modules/TA_utl/remove"
    else
        touch "$MODPATH/remove"
    fi
    exit 1
fi