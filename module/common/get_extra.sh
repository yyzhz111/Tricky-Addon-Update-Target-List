#!/system/bin/sh

MODPATH=${0%/*}
SKIPLIST="$MODPATH/skiplist"
OUTPUT="$MODPATH/exclude-list"
KBOUTPUT="$MODPATH/.extra"

. $MODPATH/util_func.sh

find_busybox
check_wget

# Fetch additional package names
wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/master/more-excldue.json" 2>/dev/null | \
grep -o '"package-name": *"[^"]*"' | \
awk -F'"' '{print $4}' > "$OUTPUT"

if [ ! -s "$OUTPUT" ]; then
    rm -f "$KBOUTPUT"
    skipkb=true
fi

# Find xposed package name
pm list packages -3 | awk -F: '{print $2}' | while read -r PACKAGE; do
    if ! grep -Fq "$PACKAGE" "$SKIPLIST"; then
        pm path "$PACKAGE" | grep "base.apk" | awk -F: '{print $2}' | tr -d '\r' | while read -r APK_PATH; do
            aapt dump xmltree "$APK_PATH" AndroidManifest.xml 2>/dev/null | grep -qE "xposed.category|xposeddescription" && echo "$PACKAGE" >> "$OUTPUT"
        done
    fi
done

if [ "$skipkb" != "true" ]; then
    wget --no-check-certificate -qO "$KBOUTPUT" "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/master/.extra"

    if [ ! -s "$KBOUTPUT" ]; then
        rm -f "$KBOUTPUT"
    fi
else
    exit 1
fi