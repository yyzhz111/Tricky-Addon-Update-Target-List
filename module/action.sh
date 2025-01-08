###########################################
## This file is NOT a part of Tricky Store
###########################################

MODPATH="/data/adb/modules/.TA_utl"
ORG_PATH="$PATH"
TMP_DIR="$MODPATH/common/tmp"
SCRIPT_DIR="/data/adb/tricky_store"
APK_PATH="$TMP_DIR/base.apk"

abort() {
    echo "$1"
    exit 1
}

download() {
    local type=${1#--}
    local url=$2
    local output=$3

    PATH=/data/adb/magisk:/data/data/com.termux/files/usr/bin:$PATH
    if command -v curl >/dev/null 2>&1; then
        if [ "$type" = "output" ]; then
            timeout 10 curl -Lo "$output" "$url"
        else
            timeout 2 curl -s "$url"
        fi
    else
        if [ "$type" = "output" ]; then
            timeout 10 busybox wget --no-check-certificate -qO "$output" "$url"
        else
            timeout 2 busybox wget --no-check-certificate -qO- "$url"
        fi
    fi
    PATH="$ORG_PATH"
}

get_webui() {
    echo "- Downloading KSU WebUI Standalone..."
    RESPONSE=$(download --fetch "https://api.github.com/repos/5ec1cff/KsuWebUIStandalone/releases/latest")
    URL=$(echo "$RESPONSE" | grep -o '"browser_download_url": "[^"]*"' | cut -d '"' -f 4)
    download --output "$URL" "$APK_PATH" || abort "! Error: APK download failed, please check your internet connection."

    echo "- Installing..."
    pm install -r "$APK_PATH" || {
        rm -f "$APK_PATH"
        abort "! Error: APK installation failed."
    }

    echo "- Done."
    rm -f "$APK_PATH"

    echo "- Launching WebUI..."
    am start -n "io.github.a13e300.ksuwebui/.WebUIActivity" -e id "tricky_store" || abort "! Error: WebUI launch failed."
}

# Launch KSUWebUI standalone or MMRL, install KSUWebUI standalone if both are not installed
if pm path io.github.a13e300.ksuwebui >/dev/null 2>&1; then
    echo "- Launching WebUI in KSUWebUIStandalone..."
    am start -n "io.github.a13e300.ksuwebui/.WebUIActivity" -e id "tricky_store"
elif pm path com.dergoogler.mmrl >/dev/null 2>&1; then
    echo "- Launching WebUI in MMRL WebUI..."
    am start -n "com.dergoogler.mmrl/.ui.activity.webui.WebUIActivity" -e MOD_ID "tricky_store"
else
    echo "! No WebUI app found"
    get_webui
fi

echo "- WebUI launched successfully."