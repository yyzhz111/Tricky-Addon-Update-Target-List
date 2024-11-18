#!/system/bin/sh

if [ -f "/data/adb/apd" ] || [ -f "/data/adb/ksud" ]; then
    exit 1
fi

MODPATH=${0%/*}
OUTPUT="$MODPATH/denylist"

# Get Magisk denylist
magisk --denylist ls 2>/dev/null | \
awk -F'|' '{print $1}' | \
grep -v "isolated" | \
sort | uniq > "$OUTPUT"

if [ ! -s "$OUTPUT" ]; then
    echo "Failed to retrieve Magisk denylist or no packages found." > "$OUTPUT"
    exit 1
fi