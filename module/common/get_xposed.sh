#!/system/bin/sh

# Get all xposed app package name
MODPATH=${0%/*}
OUTPUT="$MODPATH/xposed-list"

curl -s "https://modules.lsposed.org/modules.json" | \
 grep -o '"name":"[^"]*","description":' | \
 awk -F'"' '{print $4}' > "$OUTPUT"