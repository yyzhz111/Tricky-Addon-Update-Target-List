#!/bin/sh

# This script will put all non-system app into /data/adb/tricky_store/target.txt
MODDIR="/data/adb/tricky_store/target_list_config"

echo "- Checking config files..."
echo " "
if [ ! -f "$MODDIR/EXCLUDE" ]; then
    echo "! Exclude list is missing!"
    exit 1
else
    echo "- Exclude config file found."
    echo " "
fi
if [ ! -f "$MODDIR/ADDITION" ]; then
    echo "! Addition list is missing"
    exit 1
else
    echo "- Addition config file found."
    echo " "
fi

EXCLUDE=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$MODDIR/EXCLUDE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr '\n' '|' | sed 's/|$//')
ADDITION=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$MODDIR/ADDITION")

echo "- Overwritting target.txt"
echo " "
> /data/adb/tricky_store/target.txt

echo "- Adding apps into /data/adb/tricky_store/target.txt"
echo " "
su -c pm list packages -3 </dev/null 2>&1 | cat | awk -F: '{print $2}' | grep -Ev "$EXCLUDE" > /data/adb/tricky_store/target.txt
sleep 1

echo "- Adding addition app... "
echo " "
for app in $ADDITION; do
    app=$(echo "$app" | tr -d '[:space:]')
    if ! grep -Fq "$app" /data/adb/tricky_store/target.txt; then
        echo "$app" >> /data/adb/tricky_store/target.txt
    fi
done

echo "- target.txt updated successfully"
echo " "