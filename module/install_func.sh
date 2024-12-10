initialize() {
    # Cleanup left over
    [ -d "/data/adb/modules/$NEW_MODID" ] && rm -rf "/data/adb/modules/$NEW_MODID"

    # Set permission
    set_perm $COMPATH/get_extra.sh 0 2000 0755
    set_perm $COMPATH/get_WebUI.sh 0 2000 0755

    # Handdle Magisk/non-Magisk root manager
    if [ "$ACTION" = "false" ]; then
        rm -f "$MODPATH/action.sh"
        rm -f "$COMPATH/get_WebUI.sh"
        NEW_MODID="$MODID"
    else
        mkdir -p "$COMPATH/temp/common"
        cp "$COMPATH/.default" "$COMPATH/temp/common/.default"
        cp "$MODPATH/uninstall.sh" "$COMPATH/temp/uninstall.sh"
    fi

    #Set specific path
    sed -i "s|\"set-path\"|\"/data/adb/modules/$NEW_MODID/\"|" "$MODPATH/webui/index.js" || {
        ui_print "! Failed to set path"
        abort
    }
    sed -i "s|\"set-id\"|\"$NEW_MODID\"|" "$COMPATH/util_func.sh" || {
        ui_print "! Failed to set id"
        abort
    }
    
    # Set aapt binary
    cp "$MODPATH/module.prop" "$COMPATH/temp/module.prop"
    mv "$MODPATH/bin/$(getprop ro.product.cpu.abi)/aapt" "$COMPATH/aapt"
    set_perm $COMPATH/aapt 0 2000 0755
    rm -rf "$MODPATH/bin"
}

find_config() {
    # Remove legacy setup
    [ -f "$SCRIPT_DIR/UpdateTargetList.sh" ] && rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
    [ -d "$CONFIG_DIR" ] && rm -rf "$CONFIG_DIR"
}

migrate_old_boot_hash() {
    if [ ! -f "/data/adb/boot_hash" ]; then
        mv "$COMPATH/boot_hash" "/data/adb/boot_hash"
    else
        rm -f "$COMPATH/boot_hash"
    fi
}
