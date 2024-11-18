MODPATH="${0%/*}"
COMPATH="$MODPATH/common"
SCRIPT_DIR="/data/adb/tricky_store"

. "$COMPATH/util_func.sh"

if pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "- Launching KSU WebUI..."
    am start -n "${PACKAGE_NAME}/.WebUIActivity" -e id "$MODID"
else
    SKIP_FILE="$SCRIPT_DIR/target_list_config/skipwebui"
    if [ ! -f "$SKIP_FILE" ]; then
        echo "**********************************************"
        echo "- Do you want to install KSU WebUI standalone?"
        echo "  VOL [+]: YES"
        echo "  VOL [-]: NO"
        echo "**********************************************"

        key_check
        if [[ "$keycheck" == "KEY_VOLUMEUP" ]]; then
            echo "- Installing KSU WebUI..."
            . "$COMPATH/get_WebUI.sh"
        else
            echo "- Skipping WebUI installation..."
            touch "$SKIP_FILE"
            echo "- Skip WebUI check until next installation."
            echo ""
            update_script
        fi
    else
        update_script
    fi
fi