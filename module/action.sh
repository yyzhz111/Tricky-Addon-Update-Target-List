###########################################
## This file is NOT a part of Tricky Store
###########################################

MODPATH="/data/adb/modules/.TA_utl"
COMPATH="$MODPATH/common"
SCRIPT_DIR="/data/adb/tricky_store"

. "$COMPATH/util_func.sh"

if pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "- Launching KSU WebUI..."
    am start -n "${PACKAGE_NAME}/.WebUIActivity" -e id "$MODID"
else
    echo "- Installing KSU WebUI..."
    . "$COMPATH/get_WebUI.sh"
fi