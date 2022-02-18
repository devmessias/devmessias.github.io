i=1
find . -name "*.md" -type f | while read f
do
    # check if $f has the pt-br.en.md pattern and delete it
    # if not it will be added
    if [[ $f == *".en.md" ]]; then
        echo "-"
        rm $f
    else
        newFile=${f/\.md/\.en.md}
        #echo $newFile
        #cp $f $newFile
    fi        
    #echo "New file will be $newFile"
    #cp $f $newFile
    #echo ${f//.md/.pt-br.md}
    ((i++))
done
