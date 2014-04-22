#!/bin/bash

# source folder with the file to replace (CHANGE IT ACCORDINGLY)
FILES=/filetoreplace/*

# destination folder with the file that are replaced (CHANGE IT ACCORDINGLY)
COVERTIONPATH=/filereplaced/

for f in $FILES
do
	filename="${f##*/}"
	# echo $filename # filename of the file
	# the new file is save with the same name but on the replace folder
	FILECONVERTED=$COVERTIONPATH$filename
	# echo FILECONVERTED
	# 's/K = T/k = T/g' 
	# K = T is the String to find
	# k = T is the String to replace with K = T
	sed 's/K = T/k = T/g' $f | tee FILECONVERTED
done