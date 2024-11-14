#!/system/bin/sh

MODPATH=${0%/*}
OUTPUT="$MODPATH/exclude-list"
BBPATH="/data/adb/modules/busybox-ndk/system/*/busybox \
        /data/adb/magisk/busybox \
        /data/adb/ksu/bin/busybox \
        /data/adb/ap/bin/busybox"
            
find_busybox() {    
    for path in $BBPATH; do
        if [ -f "$path" ]; then
            BUSYBOX="$path"
            return 0
        fi
    done
    return 1
}

# Check for wget binary
if ! command -v wget >/dev/null || grep -q "wget-curl" "$(command -v wget)"; then
    if find_busybox; then
        wget() { "$BUSYBOX" wget "$@"; }
    else
        echo "Error: busybox not found in specified paths." > "$OUTPUT"
        exit 1
    fi
fi

# Fetch Xposed module package names
wget --no-check-certificate -q -O - "https://modules.lsposed.org/modules.json" 2>/dev/null | \
grep -o '"name":"[^"]*","description":' | \
awk -F'"' '{print $4}' > "$OUTPUT"

# Fetch additional package names
wget --no-check-certificate -q -O - "https://raw.githubusercontent.com/KOWX712/Tricky-Addon-Update-Target-List/master/more-excldue.json" 2>/dev/null | \
grep -o '"package-name": *"[^"]*"' | \
awk -F'"' '{print $4}' >> "$OUTPUT"

# Check if the output directory is empty
if [ ! -s "$OUTPUT" ]; then
    echo "Error: Failed to fetch data." > "$OUTPUT"
    exit 1
fi