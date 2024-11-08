#!/system/bin/sh

MODPATH=${0%/*}
OUTPUT="$MODPATH/exclude-list"

# Fetch Xposed module package names
curl -s "https://modules.lsposed.org/modules.json" | \
grep -o '"name":"[^"]*","description":' | \
awk -F'"' '{print $4}' > "$OUTPUT"

# Fetch additional package names
curl -s "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/master/more-excldue.json" | \
grep -o '"package-name": *"[^"]*"' | \
awk -F'"' '{print $4}' >> "$OUTPUT"
