initialize() {
    if [ -f "$SCRIPT_DIR/UpdateTargetList.sh" ]; then
        rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
    fi
    if [ -f "$CONFIG_DIR/skipwebui" ]; then
        rm -f "$CONFIG_DIR/skipwebui"
    fi
    if [ -d "/data/adb/modules/$NEW_MODID" ]; then
        rm -rf "/data/adb/modules/$NEW_MODID"
    fi
    
    cp "$MODPATH/module.prop" "$COMPATH/temp/module.prop"
    cp "$COMPATH/.default" "$COMPATH/temp/.default"
    mv "$COMPATH/UpdateTargetList.sh" "$SCRIPT_DIR/UpdateTargetList.sh"
    set_perm $SCRIPT_DIR/UpdateTargetList.sh 0 2000 0755
    set_perm $COMPATH/get_extra.sh 0 2000 0755
    set_perm $COMPATH/get_WebUI.sh 0 2000 0755
    
    if [ "$ACTION" = "false" ]; then
        rm -f "$MODPATH/action.sh"
        rm -f "$COMPATH/get_WebUI.sh"
        echo "**********************************************"
        echo "- Tricky Addon's visibility in root manager?"
        echo "  VOL [+]: Visible"
        echo "  VOL [-]: Invisible (default)"
        echo "**********************************************"

        key_check
        if [[ "$keycheck" == "KEY_VOLUMEUP" ]]; then
            echo "- Setting to visible..."
            rm -rf "$COMPATH/temp"
            NEW_MODID="$MODID"
        fi
    fi
    sed -i "s|\"set-path\"|\"/data/adb/modules/$NEW_MODID/common/\"|" "$MODPATH/webroot/index.js" || {
        ui_print "! Failed to set path"
        abort
    }
    sed -i "s|\"set-id\"|\"$NEW_MODID\"|" "$COMPATH/util_func.sh" || {
        ui_print "! Failed to set id"
        abort
    }
    
    mv "$MODPATH/bin/$(getprop ro.product.cpu.abi)/aapt" "$COMPATH/aapt"
    set_perm $COMPATH/aapt 0 2000 0755
    rm -rf "$MODPATH/bin"
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

find_config() {
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
}

migrate_old_boot_hash() {
    if [ ! -f "/data/adb/boot_hash" ]; then
        mv "$COMPATH/boot_hash" "/data/adb/boot_hash"
    else
        rm -f "$COMPATH/boot_hash"
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