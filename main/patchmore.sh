#!/bin/bash
#

MAJORNUMBER=0
MINORNUMBER=13
PATCHNUMBER=$(cat nextpatchnumber.txt)
VERSIONNUMBER=$MAJORNUMBER.$MINORNUMBER.$PATCHNUMBER
echo "[patchmore.sh] new version number: $VERSIONNUMBER"

# 
rm ../version-*.txt
# "git add" also has to "add" the deletion!
git add ../version-*.txt

# create new versionnumber file
touch "../version-$VERSIONNUMBER.txt"
#'git add' causes staging!
git add ../version-$VERSIONNUMBER.txt



#FILENAME=./test_lineendings.txt DEBUGGING
#rm $FILENAME
#cp $FILENAME.ori $FILENAME
#sed -i "s/__VERSION__/$VERSIONNUMBER/g" $FILENAME
#git add $FILENAME  2>warning.txt
#echo "[patchmore.sh] patch $FILENAME with version number $VERSIONNUMBER"

FILENAME=src/js/config.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
sed -i "s/__VERSION__/$VERSIONNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
# echo "[patchmore.sh] patch $FILENAME with version number $VERSIONNUMBER"
echo "[patchmore.sh] patch $FILENAME"

FILENAME=./package.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patch $FILENAME"
sleep 4

FILENAME=../h5p/development/H5P.FormulaApplet-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patch $FILENAME"

FILENAME=../h5p/development/H5PEditor.FormulaAppletEditor-$MAJORNUMBER.$MINORNUMBER/library.json
rm $FILENAME
cp $FILENAME.ori $FILENAME
sed -i "s/__MAJORVERSION__/$MAJORNUMBER/g" $FILENAME
sed -i "s/__MINORVERSION__/$MINORNUMBER/g" $FILENAME
sed -i "s/__PATCHVERSION__/$PATCHNUMBER/g" $FILENAME
git add $FILENAME  2>warning.txt
echo "[patchmore.sh] patch $FILENAME"

((PATCHNUMBER=PATCHNUMBER+1))
echo $PATCHNUMBER > ./nextpatchnumber.txt

rm ./warning.txt
# "git add" also has to "add" the deletion, but only if stashed before!
# git add ./warning.txt

# https://linuxconfig.org/bash-script-pause-script-before-proceeding
read -p "Pausing for 60 seconds" -t 60

