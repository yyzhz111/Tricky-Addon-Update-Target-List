#!/system/bin/sh

MODPATH=${0%/*}
SKIPLIST="$MODPATH/skiplist"
OUTPUT="$MODPATH/exclude-list"
KBOUTPUT="$MODPATH/.extra"

. $MODPATH/util_func.sh

check_wget

get_kb() {
    wget --no-check-certificate -qO "$KBOUTPUT" "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/.extra"
    [ -s "$KBOUTPUT" ] || rm -f "$KBOUTPUT"
}

get_unnecessary() {
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
    if [ -d "$MODPATH/temp" ]; then
        JSON=$(wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/update.json")
        REMOTE_VERSION=$(echo "$JSON" | grep -o '"versionCode": *[0-9]*' | awk -F: '{print $2}' | tr -d ' ')
        LOCAL_VERSION=$(grep -o 'versionCode=[0-9]*' "$MODPATH/temp/module.prop" | awk -F= '{print $2}')
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