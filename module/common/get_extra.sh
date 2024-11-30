#!/system/bin/sh

MODPATH=${0%/*}
SKIPLIST="$MODPATH/skiplist"
OUTPUT="$MODPATH/exclude-list"
KBOUTPUT="$MODPATH/.extra"

. $MODPATH/util_func.sh

find_busybox
check_wget

# Fetch additional package names
wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/more-excldue.json" 2>/dev/null | \
grep -o '"package-name": *"[^"]*"' | \
awk -F'"' '{print $4}' > "$OUTPUT"

if [ ! -s "$OUTPUT" ]; then
    rm -f "$KBOUTPUT"
    skipfetch=true
fi

# Find xposed package name
pm list packages -3  </dev/null 2>&1 | cat | awk -F: '{print $2}' | while read -r PACKAGE; do
    if ! grep -Fq "$PACKAGE" "$SKIPLIST"; then
        pm path "$PACKAGE" | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r' | while read -r APK_PATH; do
            aapt dump xmltree "$APK_PATH" AndroidManifest.xml 2>/dev/null | grep -qE "xposed.category|xposeddescription" && echo "$PACKAGE" >> "$OUTPUT"
        done
    fi
done

if [ "$skipfetch" != "true" ]; then
    wget --no-check-certificate -qO "$KBOUTPUT" "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/.extra"

    if [ ! -s "$KBOUTPUT" ]; then
        rm -f "$KBOUTPUT"
    fi

    if [ -d "$MODPATH/temp" ]; then
        JSON=$(wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/main/update.json")
        REMOTE_VERSION=$(echo "$JSON" | grep -o '"versionCode": *[0-9]*' | awk -F: '{print $2}' | tr -d ' ')
        LOCAL_VERSION=$(grep -o 'versionCode=[0-9]*' "$MODPATH/temp/module.prop" | awk -F= '{print $2}')
        if [ "$REMOTE_VERSION" -gt "$LOCAL_VERSION" ]; then
            echo "update"
        fi
    fi
else
    exit 1
fi
