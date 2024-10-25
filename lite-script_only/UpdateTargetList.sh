#!/bin/sh

# by KOW
# Tricky Addon Lite: Update Target List Script v1.3
# GitHub Repository: https://github.com/KOWX712/Tricky-Addon-Update-Target-List/blob/master/lite-script_only/README.md
# Telegram channel: https://t.me/kowchannel

# This script will put all non-system app into /data/adb/tricky_store/target.txt

# Configurable exclude and addition list
# DO NOT remove default package names here
EXCLUDE="
oneplus
coloros
com.android.patch
me.bmax.apatch"

ADDITION="
com.google.android.gms
io.github.vvb2060.keyattestation
io.github.vvb2060.mahoshojo
icu.nullptr.nativetest"

echo " "
echo " Staring script..."
echo " "

# Create or overwrite the target.txt file
> /data/adb/tricky_store/target.txt

echo " Adding apps to target.txt..."
echo " "

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

# Force stop gms. Not necessary, you can add it if you want
#su -c killall com.google.android.gms
#su -c killall com.google.android.gms.unstable

echo " All done!"
