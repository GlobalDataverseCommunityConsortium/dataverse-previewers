#!/bin/bash

dirLocal=$(pwd)

# go to the version folder
if [ -z "$1" ]; then
    echo "Provide the relative path to the previewer version you wish to make an all-local instance of, e.g. previewers/v1.4."
    exit 1
fi

if [ -z "$2" ]; then
    echo "To update the example curl commands, add the base URL for your local previewer installation as the second parameter."
    echo "E.g. https://yourinstitution.org/mypreviewerdir to have the Text previewer at https://yourinstitution.org/mypreviewerdir/previewers/v1.4/TextPreview.html"
    echo "The version will match the relative path you provide"
    echo ""
fi

folder="$1"
cd "${folder}"

echo Downloading local copies of remote JavaScript libraries:
sed -n 's/.*src="\(http[^"]*\)".*/\1/p' *.html | sort -u | sed -n 's/^\(.*\/\)*\(.*\)/sed -i \x27s,\0\,lib\/\2,\x27 *.html/p' > replace_js.sh
sed -n 's/.*src="\(http[^"]*\)".*/\1/p' *.html | sort -u  > urls_js.txt
source replace_js.sh
cat urls_js.txt

echo Downloading local copies of remote CSS files:
sed -n 's/.*<link.*href="\(http[^"]*\)".*/\1/p' *.html | sort -u | sed -n 's/^\(.*\/\)*\(.*\)/sed -i \x27s,\0\,css\/\2,\x27 *.html/p' > replace_css.sh
sed -n 's/.*<link.*href="\(http[^"]*\)".*/\1/p' *.html | sort -u > urls_css.txt
source replace_css.sh
cat urls_css.txt


echo Downloading local copies of remote fonts:
fonturl=`grep -m 1 https://stackpath.bootstrapcdn.com/ replace_css.sh | cut -d',' -f 2 | sed s,css/bootstrap.min.css,fonts,`
echo $fonturl/glyphicons-halflings-regular.eot > urls_fonts.txt
echo $fonturl/glyphicons-halflings-regular.svg >> urls_fonts.txt
echo $fonturl/glyphicons-halflings-regular.ttf >> urls_fonts.txt
echo $fonturl/glyphicons-halflings-regular.woff >> urls_fonts.txt
echo $fonturl/glyphicons-halflings-regular.woff2 >> urls_fonts.txt

if [ ! -d ./lib ]; then
  mkdir ./lib
fi
cd ./lib
while read url; do
    wget --quiet $url
done < "../urls_js.txt"

cd ".."
if [ ! -d ./fonts ]; then
    mkdir ./fonts
fi
cd ./fonts
while read url; do
    wget --quiet $url
done < "../urls_fonts.txt"

cd ".."
if [ ! -d ./css ]; then
  mkdir ./css
fi
cd ./css
while read url; do
    wget --quiet $url
done < "../urls_css.txt"

cd ..


if [ ! -z "$2" ]; then
cd "${dirLocal}"
echo Changing example curl commands to use local URLs
localurl="$2"
sed -i "s,https://gdcc.github.io/dataverse-previewers/previewers/v1\.[345],$localurl/$folder,g" *curlcommands.md
echo Done changing example curl commands to use local URLs
cd "${folder}"
fi

echo Cleaning Up...
rm urls_js.txt
rm urls_css.txt
rm urls_fonts.txt
rm replace_js.sh
rm replace_css.sh

echo Done
exit 0
