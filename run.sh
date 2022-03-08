echo "calling run.sh"

printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -

# execution specific variables
export SP="$1"
export URL="$2"
export OUTPUT_PATH="$3"
export SPIDER_EASE_HOME="$4"
export SPIDER_TEMPLATE_HOME="$5"

echo "SP:$SP"
echo "URL:$URL"
echo "OUTPUT_PATH:$OUTPUT_PATH"
echo "SPIDER_EASE_HOME:$SPIDER_EASE_HOME"
echo "SPIDER_TEMPLATE_HOME:$SPIDER_TEMPLATE_HOME"

################################
# [step0]: clear output folder #
################################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step0]: clear output folder"
if [ -d "$OUTPUT_PATH/$SP" ]; then rm -Rf "$OUTPUT_PATH/$SP"; fi
echo "deleted $OUTPUT_PATH/$SP"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -

############################
# [step1]: run spider ease #
############################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step1]: run spider ease"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
cd $SPIDER_EASE_HOME
npm install
npm run solo -- --retry=0 --sp="$SP" --url="$URL" --path="$OUTPUT_PATH"

###############################
# [step2]: run spider prepare #
###############################
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

#################################
# [step3]: run spider template #
#################################
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "[step3]: run spider template"
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
cd $SPIDER_TEMPLATE_HOME
./Spider.Console/bin/Debug/netcoreapp3.1/Spider.Console.exe "$OUTPUT_PATH" "UNIVERSAL--DEFAULT--REG--LEVEL-10" "$SP" "$URL" true
printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "ending run.sh"