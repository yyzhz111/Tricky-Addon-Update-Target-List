SKIPUNZIP=0
DEBUG=false
COMPATH="$MODPATH/common"
TS="/data/adb/modules/tricky_store"
SCRIPT_DIR="/data/adb/tricky_store"
CONFIG_DIR="$SCRIPT_DIR/target_list_config"
NEW_MODID=.TA_utl
kb="$COMPATH/.default"

ui_print " ";
if [ "$APATCH" ]; then
    ui_print "- APatch:$APATCH_VER│$APATCH_VER_CODE"
    ACTION=false
elif [ "$KSU" ]; then
    ui_print "- KSU:$KSU_KERNEL_VER_CODE│$KSU_VER_CODE"
    ACTION=false
elif [ "$MAGISK_VER_CODE" ]; then
    ui_print "- Magisk:$MAGISK_VER│$MAGISK_VER_CODE"
else
    ui_print " "; 
    ui_print "! recovery is not supported"; 
    abort " "; 
fi

if [ ! -d "$TS" ]; then
    ui_print "! Tricky store module is not installed"
    abort
fi

. "$MODPATH/install_func.sh"

ui_print "- Installing..."
initialize

ui_print "- Creating config directory..."
find_config
migrate_old_boot_hash

rm -f "$MODPATH/install_func.sh"

ui_print "- Installation completed successfully! "
ui_print " "