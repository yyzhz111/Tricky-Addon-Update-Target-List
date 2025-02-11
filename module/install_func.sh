initialize() {
    # Cleanup left over
    [ -d "/data/adb/modules/$NEW_MODID" ] && rm -rf "/data/adb/modules/$NEW_MODID"

    # Set permission
    set_perm $COMPATH/get_extra.sh 0 2000 0755

    # Handdle Magisk/non-Magisk root manager
    if [ "$ACTION" = "false" ]; then
        rm -f "$MODPATH/action.sh"
        NEW_MODID="$MODID"
    else
        mkdir -p "$COMPATH/update/common"
        cp "$COMPATH/.default" "$COMPATH/update/common/.default"
        cp "$MODPATH/uninstall.sh" "$COMPATH/update/uninstall.sh"
    fi

    #Set specific path
    sed -i "s|\"set-path\"|\"/data/adb/modules/$NEW_MODID/\"|" "$MODPATH/webui/scripts/main.js" || abort "! Failed to set path"

    # Set aapt binary
    cp "$MODPATH/module.prop" "$COMPATH/update/module.prop"
    mv "$MODPATH/bin/$(getprop ro.product.cpu.abi)/aapt" "$COMPATH/aapt"
    set_perm $COMPATH/aapt 0 2000 0755
    rm -rf "$MODPATH/bin"
}

find_config() {
    # Remove legacy setup
    [ -f "$SCRIPT_DIR/UpdateTargetList.sh" ] && rm -f "$SCRIPT_DIR/UpdateTargetList.sh"
    [ -d "$CONFIG_DIR" ] && rm -rf "$CONFIG_DIR"
}

migrate_config() {
    # Migrate boot_hash
    if [ ! -f "/data/adb/boot_hash" ]; then
        mv "$COMPATH/boot_hash" "/data/adb/boot_hash"
    else
        rm -f "$COMPATH/boot_hash"
    fi

    # Migrate security_patch config*
    if [ ! -s "/data/adb/security_patch" ]; then
        echo "#Tricky Addon security patch config" > "/data/adb/security_patch"
    fi
    for value in auto_config custom_config all system vendor boot; do
        if ! grep -q "^$value=" "/data/adb/security_patch"; then
            if [ "$value" = "auto_config" ]; then
                echo "$value=1" >> "/data/adb/security_patch"
            else
                echo "$value=0" >> "/data/adb/security_patch"
            fi
        fi
    done
}
