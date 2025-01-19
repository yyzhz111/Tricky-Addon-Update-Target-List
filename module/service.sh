MODPATH=${0%/*}
HIDE_DIR="/data/adb/modules/.TA_utl"
TS="/data/adb/modules/tricky_store"
SCRIPT_DIR="/data/adb/tricky_store"
TSPA="/data/adb/modules/tsupport-advance"

aapt() { "$MODPATH/common/aapt" "$@"; }

# Reset verified Boot Hash
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

# Hide module
if [ -f "$MODPATH/action.sh" ]; then
    if [ "$MODPATH" != "$HIDE_DIR" ]; then
        rm -rf "$HIDE_DIR"
        mv "$MODPATH" "$HIDE_DIR"
    fi
    MODPATH="$HIDE_DIR"
elif [ -d "$HIDE_DIR" ]; then
    rm -rf "$HIDE_DIR"
fi
rm -f "$MODPATH/module.prop"

# Symlink tricky store
if [ -f "$MODPATH/action.sh" ] && [ ! -f "$TS/action.sh" ] && [ ! -L "$TS/action.sh" ]; then
    ln -s "$MODPATH/action.sh" "$TS/action.sh"
fi
if [ ! -d "$TS/webroot" ] && [ ! -L "$TS/webroot" ]; then
    ln -s "$MODPATH/webui" "$TS/webroot"
fi

# Optimization
OUTPUT_APP="$MODPATH/common/tmp/applist"
OUTPUT_SKIP="$MODPATH/common/tmp/skiplist"
OUTPUT_TMP="$MODPATH/common/tmp/tmp_applist"

until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 1
done

mkdir -p "$MODPATH/common/tmp"
pm list packages -3 2>/dev/null | awk -F: '{print $2}' > "$OUTPUT_TMP"

SYSTEM_APP="com.google.android.gms|com.google.android.gsf|com.android.vending"
pm list package -s | awk -F: '{print $2}' | grep -Ex "$SYSTEM_APP" >> "$OUTPUT_TMP"

echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_APP"
echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_SKIP"
cat "$OUTPUT_TMP" | while read -r PACKAGE; do
    APK_PATH=$(pm path "$PACKAGE" 2>/dev/null | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r')
    [ -z "$APK_PATH" ] && APK_PATH=$(pm path "$PACKAGE" 2>/dev/null | grep ".apk" | awk -F: '{print $2}' | tr -d '\r')
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

rm -f "$OUTPUT_TMP"
