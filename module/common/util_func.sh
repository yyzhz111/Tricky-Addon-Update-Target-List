PACKAGE_NAME="io.github.a13e300.ksuwebui"
MODID="set-id"
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

download_webui() {
    wget --no-check-certificate -P "$APK_DIR" "$URL"
    if [ $? -ne 0 ]; then
        echo "Error: APK download failed."
        exit 1
    fi
}

install_webui() {
    pm install -r "$APK_PATH" </dev/null 2>&1 | cat
    if [ $? -ne 0 ]; then
        echo "Error: APK installation failed."
        rm -f "$APK_PATH"
        exit 1
    fi
}