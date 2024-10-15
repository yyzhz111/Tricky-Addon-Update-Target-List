SKIPUNZIP=0
DEBUG=false
if [ "$(which magisk)" ]; then
    BM="Magisk:$MAGISK_VER│$MAGISK_VER_CODE"
elif [ "$KSU" ]; then
    BM="KSU:$KSU_KERNEL_VER_CODE│$KSU_VER_CODE"
elif [ "$APATCH" ]; then
    BM="APatch:$APATCH_VER│$APATCH_VER_CODE"
else
    ui_print " "; 
    ui_print "! recovery is not supported"; 
    abort " "; 
fi

print_modname() {
  ui_print "*******************************************************"
  ui_print "Installing Tricky Addon: Update Target List"
  ui_print "Author: KOWX712"
  ui_print "*******************************************************"
}

if [ -d /data/adb/modules/tricky_store ]; then
    echo "- Tricky store module installed"
else
    echo "! Tricky store module is not installed"
    exit 1  
fi

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

ui_print "- Installing..."
COMPATH="$MODPATH/common"
CONFIG_DIR="/data/adb/tricky_store/target_list_config"
SCRIPT_DIR="/data/adb/tricky_store"
cp "$MODPATH/module.prop" "$COMPATH/disabled"
sed -i 's/^description=.*/description=Tricky store is disabled/' "$COMPATH/disabled"
cp "$MODPATH/module.prop" "$COMPATH/ninstalled"
sed -i 's/^description=.*/description=Tricky store is not installed/' "$COMPATH/ninstalled"
cp "$MODPATH/module.prop" "$COMPATH/normal"
CONFIG_DIR="/data/adb/tricky_store/target_list_config"
SCRIPT_DIR="/data/adb/tricky_store"
mkdir -p "$CONFIG_DIR"
cp "$COMPATH/UpdateTargetList.sh" "$SCRIPT_DIR/UpdateTargetList.sh"
mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"

if [ ! -f "/data/adb/modules/TA_utl/system.prop" ]; then
    mv "$COMPATH/system.prop" "$MODPATH/system.prop"
else
    rm -f "$COMPATH/system.prop"
    mv "/data/adb/modules/TA_utl/system.prop" "$MODPATH/system.prop"
fi

kb="$COMPATH/.keybox"
ui_print "*********************************************"
ui_print "- Do you want to replace tricky store keybox?"
ui_print "  Volume up: YES"
ui_print "  Volume up: NO"
ui_print "*********************************************"
key_check
if [[ "$keycheck" == "KEY_VOLUMEUP" ]]; then
  ui_print "*********************************************"
  ui_print "- Replacing keybox..."
  ui_print "*********************************************"
  mv "$SCRIPT_DIR/keybox.xml" "$COMPATH/origkeybox"
  mv "$kb" "$SCRIPT_DIR/keybox.xml"
else
  rm -f "$kb"
fi

ui_print " "
ui_print "- Installation completed successfully! "
ui_print " "
