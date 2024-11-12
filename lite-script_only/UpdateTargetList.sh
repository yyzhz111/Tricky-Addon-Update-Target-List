#!/bin/sh

# Tricky Addon Lite: Update Target List Script v2.2
# GitHub Repository: https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/master/lite-script_only/README.md
# Telegram channel: https://t.me/kowchannel

# This script will put all non-system app into /data/adb/tricky_store/target.txt

###################################################
# Configurable exclude and addition list
# DO NOT remove default package names here
###################################################

EXCLUDE="
oneplus
coloros
miui
com.android.patch
me.bmax.apatch
me.garfieldhan.apatch.next"

ADDITION="
com.google.android.gms
io.github.vvb2060.keyattestation
io.github.vvb2060.mahoshojo
icu.nullptr.nativetest"

###################################################
# Script
###################################################

echo " "
echo "- Staring script..."
echo " "
echo "- Adding apps to target.txt..."

EXCLUDE=$(echo "$EXCLUDE" | tr '\n' '|' | sed 's/^|//;s/|$//')
ADDITION=$(echo "$ADDITION" | tr '\n' ' ' | sed 's/^ //;s/ $//')

# Add all non-system apps to the target file and remove exclusions
su -c pm list packages -3 </dev/null 2>&1 | cat | awk -F: '{print $2}' | grep -Ev "$EXCLUDE" > /data/adb/tricky_store/target.txt
sleep 1

# Add additional apps to the target file if they are not already present
for app in $ADDITION; do
    if ! grep -qx "$app" /data/adb/tricky_store/target.txt; then
        echo "$app" >> /data/adb/tricky_store/target.txt
    fi
done

echo " "
echo "- All done!"
