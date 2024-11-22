initialize() {
    if [ -f "$SCRIPT_DIR/UpdateTargetList.sh" ]; then
        rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
    fi
    if [ -f "$CONFIG_DIR/skipwebui" ]; then
        rm -f "$CONFIG_DIR/skipwebui"
    fi
    cp "$MODPATH/module.prop" "$COMPATH/module.prop.orig"
    mv "$COMPATH/UpdateTargetList.sh" "$SCRIPT_DIR/UpdateTargetList.sh"

    sed -i "s|\"set-path\"|\"/data/adb/modules/$MODID/common/\"|" "$MODPATH/webroot/index.js" || {
        ui_print "! Failed to set path"
        abort
    }
    sed -i "s|\"set-id\"|\"$MODID\"|" "$COMPATH/util_func.sh" || {
        ui_print "! Failed to set id"
        abort
    }
    
    mv "$MODPATH/bin/$(getprop ro.product.cpu.abi)/aapt" "$COMPATH/aapt"
    rm -rf "$MODPATH/bin"
    
    set_perm $COMPATH/aapt 0 2000 0755
    set_perm $SCRIPT_DIR/UpdateTargetList.sh 0 2000 0755
    set_perm $COMPATH/get_extra.sh 0 2000 0755
    set_perm $COMPATH/get_WebUI.sh 0 2000 0755
    
    if [ "$ACTION" = "false" ]; then
        rm -f "$MODPATH/action.sh"
        rm -f "$COMPATH/get_WebUI.sh"
    fi
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
        if [ -f "$ORG_DIR/boot_hash" ]; then
            mv "$ORG_DIR/boot_hash" "/data/adb/boot_hash"
        fi
            mv "$COMPATH/boot_hash" "/data/adb/boot_hash"
    else
        rm -f "$COMPATH/boot_hash"
    fi

    # Migrate from old version setup
    if [ -f "$ORG_DIR/system.prop" ]; then
        hash_value=$(sed -n 's/^ro.boot.vbmeta.digest=//p' "$ORG_DIR/system.prop")
        if [ -n "$hash_value" ]; then
            echo -e "\n$hash_value" >> "/data/adb/boot_hash"
        fi
    fi
}