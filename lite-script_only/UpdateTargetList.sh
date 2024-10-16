#!/bin/sh

# by KOW
# v1.2
# GitHub release: https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/latest
# telegram channel: https://t.me/kowchannel

# This script will put all non-system app into /data/adb/tricky_store/target.txt
# Using module to put normal app into system app may exclude corresponding app from this script too, please disable it if you found this script doesn't work.

echo " "
echo " Staring script..."
echo " "

# Create or overwrite the target.txt file
su -c > /data/adb/tricky_store/target.txt

echo " Adding apps to target.txt..."
echo " "

EXCLUDE="oneplus|coloros|com.android.patch|me.bmax.apatch"
# Add all non-system apps to the target file and remove exclusions
su -c pm list packages -3 </dev/null 2>&1 | cat | awk -F: '{print $2}' | grep -Ev "$EXCLUDE" > /data/adb/tricky_store/target.txt
sleep 1

# Add extra package names if any app excluded by the script (DO NOT remove default package here)
ADDITION="com.google.android.gms io.github.vvb2060.keyattestation io.github.vvb2060.mahoshojo icu.nullptr.nativetest"
for app in $ADDITION; do
    if ! grep -qx "$app" /data/adb/tricky_store/target.txt; then
        echo "$app" >> /data/adb/tricky_store/target.txt
    fi
done

# Force stop gms. Not necessary, you can add it if you want
#su -c killall com.google.android.gms
#su -c killall com.google.android.gms.unstable

echo " All done!"
