PACKAGE_NAME="io.github.a13e300.ksuwebui"
MODID="set-id"
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

check_wget() {
    if ! command -v wget >/dev/null || grep -q "wget-curl" "$(command -v wget)"; then
        if find_busybox; then
            wget() { "$BUSYBOX" wget "$@"; }
        else
            echo "Error: busybox not found." > "$OUTPUT"
            exit 1
        fi
    fi
}

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

key_check() {
    while true; do
        key_check=$(/system/bin/getevent -qlc 1)
        key_event=$(echo "$key_check" | awk '{ print $3 }' | grep 'KEY_')
        key_status=$(echo "$key_check" | awk '{ print $4 }')
        if [[ "$key_event" == *"KEY_"* && "$key_status" == "DOWN" ]]; then
            keycheck="$key_event"
            break
        fi
    done
    while true; do
        key_check=$(/system/bin/getevent -qlc 1)
        key_event=$(echo "$key_check" | awk '{ print $3 }' | grep 'KEY_')
        key_status=$(echo "$key_check" | awk '{ print $4 }')
        if [[ "$key_event" == *"KEY_"* && "$key_status" == "UP" ]]; then
            break
        fi
    done
}

update_script() {
    echo "**********************************************"
    echo "- Starting script..."
    echo ""

    if [[ ! -f "$SCRIPT_DIR/UpdateTargetList.sh" ]]; then
        echo "! Script missing, please install module again."
        echo "**********************************************"
        exit 1
    else
        . "$SCRIPT_DIR/UpdateTargetList.sh"
    fi

    echo "**********************************************"
    echo ""
    echo "\(__All set!__)/"
    echo "Exiting in 2 seconds..."
}
