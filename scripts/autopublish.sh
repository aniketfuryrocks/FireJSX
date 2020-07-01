FOLDER=dist

clr_scr() {
  tput clear
  tput bold
  tput setaf 2
  echo "AUTO PUBLISH SCRIPT"
  echo ""
  echo "      $1      "
  echo ""
  tput setaf 3
  sleep 0.5
}

error() {
  tput bold
  tput setaf 1
  echo "AUTO PUBLISH SCRIPT : ERROR ⚠ "
  echo ""
  echo "      $1      "
  echo ""
  if [ "$2" == "rm" ]; then
    rm package.json
  fi
  exit
}
sh scripts/sync.sh || error "Error Syncing to $FOLDER"
clr_scr "Syncing package.json"
cp -v package.json $FOLDER/package.json || error "Error copying package.json to $FOLDER"
clr_scr "Publishing"
cd $FOLDER || error "Error moving to $FOLDER"
if [ -z "$1" ]; then
  clr_scr "Publishing to latest branch"
  yarn publish --access public || error "Error publishing" "rm"
else
  clr_scr "Publishing to $1 branch"
  yarn publish --access public --tag "$1" || error "Error publishing" "rm"
fi
clr_scr "Package.json"
rm package.json
clr_scr "     DONE (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧"
