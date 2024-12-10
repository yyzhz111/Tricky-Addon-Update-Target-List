###########################################
## This file is NOT a part of Tricky Store
###########################################

MODPATH="/data/adb/modules/.TA_utl"
COMPATH="$MODPATH/common"
SCRIPT_DIR="/data/adb/tricky_store"

. "$COMPATH/util_func.sh"

if pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "- Launching WebUI in KSUWebUIStandalone..."
    am start -n "${PACKAGE_NAME}/.WebUIActivity" -e id "tricky_store"
elif pm list packages | grep -q "com.dergoogler.mmrl"; then
    echo "- Launching WebUI in MMRL WebUI..."
    am start -n "com.dergoogler.mmrl/.ui.activity.webui.WebUIActivity" -e MOD_ID "tricky_store"
else
    echo "- Installing KSU WebUI..."
    . "$COMPATH/get_WebUI.sh"
fi