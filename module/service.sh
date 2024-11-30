MODPATH=${0%/*}
HIDE_DIR="/data/adb/modules/.TA_utl"
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

if [ -d "$MODPATH/common/temp" ]; then
    if [ "$KSU" ] || [ "$APATCH" ]; then
        rm -f "$MODPATH/module.prop"
    fi
    if [ ! -d "$HIDE_DIR" ]; then
        mv "$MODPATH" "$HIDE_DIR"
    elif [[ "$MODPATH" != "$HIDE_DIR" ]]; then
        rm -rf "$MODPATH"
        exit 0
    fi
    MODPATH="$HIDE_DIR"
fi

OUTPUT_APP="$MODPATH/common/applist"
OUTPUT_SKIP="$MODPATH/common/skiplist"

if [ ! -d "$TS" ]; then
    if [ -d "$MODPATH/common/temp" ]; then
        mkdir -p "/data/adb/modules/TA_utl"
        cp -rf "$MODPATH/common/temp/*" "/data/adb/modules/TA_utl/"
        touch "/data/adb/modules/TA_utl/remove"
        exit 1
    else
        touch "$MODPATH/remove"
        exit 1
    fi
elif  [ -f "$TS/disable" ]; then
    exit 1
else
    if [ -f "$MODPATH/action.sh" ]; then
        if [ -f "$TS/action.sh" ]; then
            rm -f "$TS/action.sh"
        fi
        ln -s "$MODPATH/action.sh" "$TS/action.sh"
    else
        if [ -d "$TS/webroot" ]; then
            rm -rf "$TS/webroot"
        fi
        if [ -d "$MODPATH/common/temp" ]; then
            ln -s "$MODPATH/webroot" "$TS/webroot"
        fi
    fi
    until [ "$(getprop sys.boot_completed)" = "1" ]; do
        sleep 1
    done
    echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_APP"
    echo "# This file is generated from service.sh to speed up load time" > "$OUTPUT_SKIP"
    pm list packages -3 </dev/null 2>&1 | cat | awk -F: '{print $2}' | while read -r PACKAGE; do
        APK_PATH=$(pm path "$PACKAGE" </dev/null 2>&1 | cat | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r')
        if [ -n "$APK_PATH" ]; then
            APP_NAME=$(aapt dump badging "$APK_PATH" </dev/null 2>&1 | cat | grep "application-label:" | sed "s/application-label://g; s/'//g")
            echo "app-name: $APP_NAME, package-name: $PACKAGE" >> "$OUTPUT_APP"
        else
            echo "app-name: Unknown App package-name: $PACKAGE" >> "$OUTPUT_APP"
        fi
        if ! aapt dump xmltree "$APK_PATH" AndroidManifest.xml </dev/null 2>&1 | cat | grep -qE "xposed.category|xposeddescription"; then
            echo "$PACKAGE" >> "$OUTPUT_SKIP"
        fi
    done
    . "$SCRIPT_DIR/UpdateTargetList.sh"
fi
