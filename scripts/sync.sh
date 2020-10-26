FOLDER=dist

clr_scr() {
  tput clear
  tput bold
  tput setaf 2
  echo "SYNC SCRIPT"
  echo ""
  echo "      $1      "
  echo ""
  tput setaf 3
  sleep .5
}

error() {
  tput bold
  tput setaf 1
  echo "SYNC: ERROR ⚠ "
  echo ""
  echo "      $1      "
  echo ""
  exit 1
}

clr_scr "Removing contents of $FOLDER"
rm -rf $FOLDER/* || error "Error removing contents of $FOLDER"

clr_scr "Running TypeScript Compiler"
tsc || error "Error compiling ts to js"

clr_scr "Copying LICENSE"
cp -v LICENSE $FOLDER/LICENSE || error "Error copying LICENSE to $FOLDER"

clr_scr "Copying README"
cp -v README.md $FOLDER/README.md || error "Error copying README to $FOLDER"

clr_scr "     SYNC COMPLETE (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧"
