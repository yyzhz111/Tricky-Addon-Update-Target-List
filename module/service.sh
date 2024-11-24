MODPATH=${0%/*}
OUTPUT_APP="$MODPATH/common/applist"
OUTPUT_SKIP="$MODPATH/common/skiplist"
TS="/data/adb/modules/tricky_store"
SCRIPT_DIR="/data/adb/tricky_store"
TSPA="/data/adb/modules/tsupport-advance"

aapt() { "$MODPATH/common/aapt" "$@"; }

hash_value=$(grep -v '^#' "/data/adb/boot_hash" | tr -d '[:space:]')
if [ -n "$hash_value" ]; then
    resetprop -n ro.boot.vbmeta.digest "$hash_value"
fi

# Disable TSupport-A auto update target to prevent overwrite
if [ -d "$TSPA" ]; then
    touch "/storage/emulated/0/stop-tspa-auto-target"
elif [ ! -d "$TSPA" ] && [ -f "/storage/emulated/0/stop-tspa-auto-target" ]; then
    rm -f "/storage/emulated/0/stop-tspa-auto-target"
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
    echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_APP"
    echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_SKIP"
    pm list packages -3 | awk -F: '{print $2}' | while read -r PACKAGE; do
        APK_PATH=$(pm path "$PACKAGE" | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r')
        if [ -n "$APK_PATH" ]; then
            APP_NAME=$(aapt dump badging "$APK_PATH" 2>/dev/null | grep "application-label:" | sed "s/application-label://g; s/'//g")
            echo "app-name: $APP_NAME, package-name: $PACKAGE" >> "$OUTPUT_APP"
        else
            echo "app-name: Unknown App package-name: $PACKAGE" >> "$OUTPUT_APP"
        fi
        if ! aapt dump xmltree "$APK_PATH" AndroidManifest.xml 2>/dev/null | grep -qE "xposed.category|xposeddescription"; then
            echo "$PACKAGE" >> "$OUTPUT_SKIP"
        fi
    done
    . "$SCRIPT_DIR/UpdateTargetList.sh"
fi