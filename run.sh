echo "calling run.sh"

printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -

# execution specific variables
export SP="$1"
export URL="$2"

echo "SP:$SP"
echo "URL:$URL"

# fixed variables
export OUTPUT_PATH="C:\Users\dinusha.ambagahawita\projects\git\spider.ease\downloads"
export SPIDER_EASE_HOME="C:\Users\dinusha.ambagahawita\projects\git\spider.ease"
export SPIDER_TEMPLATE_HOME="C:\Users\dinusha.ambagahawita\projects\git\spider.templates"

#########################
# [step1]: run spider ease
#########################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step1]: run spider ease"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
cd $SPIDER_EASE_HOME
npm install
npm run solo -- --retry=0 --sp="$SP" --url="$URL"

############################
# [step2]: run spider prepare
############################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step2]: run spider prepare"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
cd $OUTPUT_PATH/$SP
if compgen -G "*.html" > /dev/null; then
    echo "removing extention from HTML files"
    for file in *.html; do
        mv -- "$file" "${file%%.html}"
    done
fi

##############################
# [step3]: run spider templates
##############################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step3]: run spider templates"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
cd $SPIDER_TEMPLATE_HOME
./Spider.Console/bin/Debug/netcoreapp3.1/Spider.Console.exe "$OUTPUT_PATH" "UNIVERSAL--DEFAULT--REG--LEVEL-10" "$URL" true
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "ending run.sh"