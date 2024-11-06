SKIPUNZIP=0
DEBUG=false

ui_print " ";
if [ "$APATCH" ]; then
    ui_print "- APatch:$APATCH_VER│$APATCH_VER_CODE"
elif [ "$KSU" ]; then
    ui_print "- KSU:$KSU_KERNEL_VER_CODE│$KSU_VER_CODE"
elif [ "$MAGISK_VER_CODE" ]; then
    ui_print "- Magisk:$MAGISK_VER│$MAGISK_VER_CODE"
else
    ui_print " "; 
    ui_print "! recovery is not supported"; 
    abort " "; 
fi

COMPATH="$MODPATH/common"
TS="/data/adb/modules/tricky_store"
SCRIPT_DIR="/data/adb/tricky_store"
CONFIG_DIR="$SCRIPT_DIR/target_list_config"
MODNAME=$(grep '^id=' "$MODPATH/module.prop" | awk -F= '{print $2}' | xargs)
ORG_DIR="/data/adb/modules/$MODNAME"
kb="$COMPATH/.default"

if [ -d "$TS" ]; then
    ui_print "- Tricky store module installed"
else
    ui_print "! Tricky store module is not installed"
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
    EXCLUDE=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/EXCLUDE")
    for app in $EXCLUDE; do
        app=$(echo "$app" | tr -d '[:space:]')
        if ! grep -Fq "$app" $COMPATH/EXCLUDE; then
            echo "$app" >> $COMPATH/EXCLUDE
        fi
    done
    mv "$COMPATH/EXCLUDE" "$CONFIG_DIR/EXCLUDE"
}

add_addition() {
    ADDITION=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/ADDITION")
    for app in $ADDITION; do
        app=$(echo "$app" | tr -d '[:space:]')
        if ! grep -Fq "$app" $COMPATH/ADDITION; then
            echo "$app" >> $COMPATH/ADDITION
        fi
    done
    mv "$COMPATH/ADDITION" "$CONFIG_DIR/ADDITION"
}

ui_print "- Installing..."

if [ -f "$SCRIPT_DIR/UpdateTargetList.sh" ]; then
    rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
fi
cp "$MODPATH/module.prop" "$COMPATH/module.prop.orig"
mv "$COMPATH/UpdateTargetList.sh" "$SCRIPT_DIR/UpdateTargetList.sh"

sed -i "s|\"set-path\"|\"/data/adb/modules/$MODNAME/common/\"|" "$MODPATH/webroot/index.js" || ui_print "! fail to replace path"

# Curl binary is used to fetch xposed module package name list from https://modules.lsposed.org/modules.json
if [ ! -f "/system/bin/curl" ]; then
    mkdir -p "$MODPATH/system/bin"
    mv "$MODPATH/bin/$(getprop ro.product.cpu.abi)/curl" "$MODPATH/system/bin/curl"
    set_perm "$MODPATH/system/bin/curl" 0 2000 0777
fi
rm -rf "$MODPATH/bin"

set_perm $SCRIPT_DIR/UpdateTargetList.sh 0 2000 0755
set_perm $COMPATH/get_xposed.sh 0 2000 0755

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
    ui_print "- Migrating old config data"
else
    ui_print "- Creating config folder $CONFIG_DIR"
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

ui_print "*********************************************"
ui_print "- Do you want to replace tricky store keybox?"
ui_print "  VOL [+]: YES"
ui_print "  VOL [-]: NO"
ui_print "*********************************************"
key_check
if [[ "$keycheck" == "KEY_VOLUMEUP" ]]; then
    ui_print "*********************************************"
    ui_print "- Backing up original keybox..."
    ui_print "- Replacing keybox..."
    ui_print "*********************************************"
    if [ -f "$ORG_DIR/common/origkeybox" ]; then
        mv "$ORG_DIR/common/origkeybox" "$COMPATH/origkeybox"
    else
        mv "$SCRIPT_DIR/keybox.xml" "$COMPATH/origkeybox"
    fi
    mv "$kb" "$SCRIPT_DIR/keybox.xml"
else
    if [ -f "$ORG_DIR/common/origkeybox" ]; then
        mv "$ORG_DIR/common/origkeybox" "$COMPATH/origkeybox"
    else
        rm -f "$kb"
    fi
fi

ui_print "- Installation completed successfully! "
ui_print " "