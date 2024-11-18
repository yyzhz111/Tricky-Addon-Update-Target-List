#!/bin/sh

# This script will put non-system app into /data/adb/tricky_store/target.txt
CONFIG_DIR="/data/adb/tricky_store/target_list_config"

echo "- Checking config files..."
echo " "
if [ ! -f "$CONFIG_DIR/EXCLUDE" ]; then
    echo "! Exclude list is missing, please install module again"
    exit 1
else
    echo "- Exclude config file found"
    echo " "
fi
if [ ! -f "$CONFIG_DIR/ADDITION" ]; then
    echo "! Addition list is missing, please install module again"
    exit 1
else
    echo "- Addition config file found"
    echo " "
fi

EXCLUDE=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/EXCLUDE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
ADDITION=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/ADDITION" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

for app in $ADDITION; do
    app=$(echo "$app" | tr -d '[:space:]')
    if grep -Fq "$app" "$CONFIG_DIR/EXCLUDE"; then
        sed -i "\|^$app$|d" "$CONFIG_DIR/EXCLUDE"
    fi
done

EXCLUDE=$(grep -vE '^[[:space:]]*#|^[[:space:]]*$' "$CONFIG_DIR/EXCLUDE" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr '\n' '|' | sed 's/|$//')

echo "- Adding apps into /data/adb/tricky_store/target.txt..."
echo " "
pm list packages -3 </dev/null 2>&1 | awk -F: '{print $2}' | grep -Ev "$EXCLUDE" > /data/adb/tricky_store/target.txt

echo "- Adding addition app..."
echo " "
for app in $ADDITION; do
    app=$(echo "$app" | tr -d '[:space:]')
    if ! grep -Fq "$app" /data/adb/tricky_store/target.txt; then
        echo "$app" >> /data/adb/tricky_store/target.txt
    fi
done

echo "- target.txt updated successfully"
echo " "