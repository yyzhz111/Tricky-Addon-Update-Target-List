SCRIPT_DIR="/data/adb/tricky_store"

echo "**********************************************"
echo "- Staring script..."
echo " "

if [ ! -f "$SCRIPT_DIR/UpdateTargetList.sh" ]; then
    echo "! Script missing, please install module again"
    echo "**********************************************"
    exit 1
else
    . "$SCRIPT_DIR/UpdateTargetList.sh"
fi

echo "**********************************************"
echo "\(__All set!__)/"
echo "Exiting in 2 seconds..."
sleep 2