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
    # remove empty file
    if [ -f "/data/adb/boot_hash" ]; then
        hash_value=$(grep -v '^#' "/data/adb/boot_hash" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
        [ -z "$hash_value" ] && rm -f /data/adb/boot_hash || echo "$hash_value" > /data/adb/boot_hash
    fi

    # Migrate security_patch config*
    if [ -f "/data/adb/security_patch" ]; then
        if grep -q "^auto_config=1" "/data/adb/security_patch"; then
            touch "/data/adb/tricky_store/security_patch_auto_config"
        fi
        rm -f "/data/adb/security_patch"
    fi

    # Additional system app
    SYSTEM_APP="
    com.google.android.gms
    com.google.android.gsf
    com.android.vending
    com.oplus.deepthinker
    com.heytap.speechassist
    com.coloros.sceneservice"
    touch "/data/adb/tricky_store/system_app"
    for app in $SYSTEM_APP; do
        if pm list packages -s | grep -q "$app" && ! grep -q "$app" "/data/adb/tricky_store/system_app"; then
            echo "$app" >> "/data/adb/tricky_store/system_app"
        fi
    done
}
