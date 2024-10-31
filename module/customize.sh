SKIPUNZIP=0
DEBUG=false
if [ "$MAGISK_VER_CODE" ]; then
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

COMPATH="$MODPATH/common"
TS="/data/adb/tricky_store"
CONFIG_DIR="$TS/target_list_config"
MODNAME=$(grep '^id=' "$MODPATH/module.prop" | awk -F= '{print $2}' | xargs)
ORG_DIR="/data/adb/modules/$MODNAME"
EXCLUDE=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/EXCLUDE")
ADDITION=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/ADDITION")

if [ -d "$TS" ]; then
    echo "- Tricky store module installed"
else
    echo "! Tricky store module is not installed"
    abort " " 
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

add_exclude() {
  for app in $EXCLUDE; do
      if ! grep -qx "$app" $COMPATH/EXCLUDE; then
          echo "$app" >> $COMPATH/EXCLUDE
      fi
  done
  mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
}

add_addition() {
  for app in $ADDITION; do
      if ! grep -qx "$app" $COMPATH/ADDITION; then
          echo "$app" >> $COMPATH/ADDITION
      fi
  done
  mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"
}

ui_print "- Installing..."

if [ -f "$TS/UpdateTargetList.sh" ]
    rm -f "$TS/UpdateTargetList.sh"
fi
mv "$COMPATH/UpdateTargetList.sh" "$TS/UpdateTargetList.sh"
cp "$MODPATH/module.prop" "$COMPATH/module.prop.orig"

if [ -d "$CONFIG_DIR" ]; then
    if [ ! -f "$CONFIG_DIR/EXCLUDE" ] && [ ! -f "$CONFIG_DIR/ADDITION" ]; then
        mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
        mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"
    elif [ ! -f "$CONFIG_DIR/ADDITION" ]; then
        mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"
        add_exclude
    elif [ ! -f "$CONFIG_DIR/EXCLUDE" ]; then
        mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
        add_addition
    else
        add_exclude
        add_addition
    fi
else
    mkdir -p "$CONFIG_DIR"
    mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
    mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"
fi

if [ ! -f "$ORG_DIR/boot_hash" ]; then
    mv "$COMPATH/boot_hash" "$MODPATH/boot_hash"
else
    rm -f "$COMPATH/boot_hash"
    mv "$ORG_DIR/boot_hash" "$MODPATH/boot_hash"
fi

# Migrate from old version setup
if [ -f "$ORG_DIR/system.prop" ]; then
    hash_value=$(sed -n 's/^ro.boot.vbmeta.digest=//p' "$ORG_DIR/system.prop")
    if [ -n "$hash_value" ]; then
        echo -e "\n$hash_value" >> "$MODPATH/boot_hash"
    fi
fi

kb="$COMPATH/.keybox"
ui_print "*********************************************"
ui_print "- Do you want to replace tricky store keybox?"
ui_print "  VOL [+]: YES"
ui_print "  VOL [-]: NO"
ui_print "*********************************************"
key_check
if [[ "$keycheck" == "KEY_VOLUMEUP" ]]; then
    ui_print "*********************************************"
    ui_print "- Replacing keybox..."
    ui_print "*********************************************"
    
    if [ -f "$ORG_DIR/common/origkeybox" ]; then
        mv "$ORG_DIR/common/origkeybox" "$COMPATH/origkeybox"
    else
        mv "$TS/keybox.xml" "$COMPATH/origkeybox"
    fi
    
    mv "$kb" "$TS/keybox.xml"
else
    if [ -f "$ORG_DIR/common/origkeybox" ]; then
        mv "$ORG_DIR/common/origkeybox" "$COMPATH/origkeybox"
    else
        rm -f "$kb"
    fi
fi

ui_print " "
ui_print "- Installation completed successfully! "
ui_print " "
