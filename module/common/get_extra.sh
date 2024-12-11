#!/system/bin/sh

MODPATH=${0%/*}
SKIPLIST="$MODPATH/tmp/skiplist"
OUTPUT="$MODPATH/tmp/exclude-list"
KBOUTPUT="$MODPATH/tmp/.extra"
BBPATH="/data/adb/magisk/busybox \
/data/adb/ksu/bin/busybox \
/data/adb/ap/bin/busybox \
/data/adb/modules/busybox-ndk/system/*/busybox"

check_wget() {
    for path in $BBPATH; do
        [ -f "$path" ] && BUSYBOX="$path" && break
    done
    if ! command -v wget >/dev/null || grep -q "wget-curl" "$(command -v wget)"; then
        if [ -n "$BUSYBOX" ]; then
            wget() { "$BUSYBOX" wget "$@"; }
        else
            exit 1
        fi
    fi
}

aapt() { "$MODPATH/aapt" "$@"; }

get_kb() {
    check_wget
    wget --no-check-certificate -qO "$KBOUTPUT" "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/.extra"
    [ -s "$KBOUTPUT" ] || rm -f "$KBOUTPUT"
}

get_unnecessary() {
    check_wget
    if [ ! -s "$OUTPUT" ] || [ ! -f "$OUTPUT" ]; then
        wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/more-excldue.json" 2>/dev/null | \
        grep -o '"package-name": *"[^"]*"' | \
        awk -F'"' '{print $4}' > "$OUTPUT"
    fi
    get_xposed
}

get_xposed() {
    pm list packages -3 | awk -F: '{print $2}' | while read -r PACKAGE; do
        if ! grep -Fq "$PACKAGE" "$SKIPLIST" && ! grep -Fq "$PACKAGE" "$OUTPUT"; then
            pm path "$PACKAGE" | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r' | while read -r APK_PATH; do
                aapt dump xmltree "$APK_PATH" AndroidManifest.xml 2>/dev/null | grep -qE "xposed.category|xposeddescription" && echo "$PACKAGE" >> "$OUTPUT"
            done
        fi
    done
}

check_update() {
    check_wget
    if [ -d "$MODPATH/update" ]; then
        JSON=$(wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/update.json")
        REMOTE_VERSION=$(echo "$JSON" | grep -o '"versionCode": *[0-9]*' | awk -F: '{print $2}' | tr -d ' ')
        LOCAL_VERSION=$(grep -o 'versionCode=[0-9]*' "$MODPATH/update/module.prop" | awk -F= '{print $2}')
        if [ "$REMOTE_VERSION" -gt "$LOCAL_VERSION" ]; then
            echo "update"
        fi
    fi
}

case "$1" in 
	--kb) get_kb; exit ;;
	--unnecessary) get_unnecessary; exit ;;
	--xposed) get_xposed; exit ;;
	--update) check_update; exit ;;
esac
