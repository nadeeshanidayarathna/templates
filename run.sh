echo "calling run.sh"

printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -

# execution specific variables
export SP="$1"
export URL="$2"
export OUTPUT_PATH="$3"
export SPIDER_EASE_HOME="$4"
export SPIDER_TEMPLATE_HOME="$5"
export COMMANDS="$6"

echo "SP:$SP"
echo "URL:$URL"
echo "OUTPUT_PATH:$OUTPUT_PATH"
echo "SPIDER_EASE_HOME:$SPIDER_EASE_HOME"
echo "SPIDER_TEMPLATE_HOME:$SPIDER_TEMPLATE_HOME"
echo "COMMANDS:$COMMANDS"

if [[ "$COMMANDS" == *"CLEAR"* ]]; then
    ################################
    # [step0]: clear output folder #
    ################################
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "[step0]: running command CLEAR"
    if [ -d "$OUTPUT_PATH/$SP" ]; then rm -Rf "$OUTPUT_PATH/$SP"; fi
    echo "deleted $OUTPUT_PATH/$SP"
fi

if [[ "$COMMANDS" == *"EASE"* ]]; then
    ############################
    # [step1]: run spider ease #
    ############################
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "[step1]: running command EASE"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    cd $SPIDER_EASE_HOME
    npm install
    npm run scraper -- --sp="$SP" --url="$URL" --path="$OUTPUT_PATH"
    if [[ "$?" != "0" ]]; then
        echo "run.sh FAILED with run spider ease"
        exit 1
    fi
fi

if [[ "$COMMANDS" == *"PREPARE"* ]]; then
    ###############################
    # [step2]: run spider prepare #
    ###############################
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "[step2]: running command PREPARE"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    cd $OUTPUT_PATH/$SP
    if compgen -G "*.html" > /dev/null; then
        echo "removing extention from HTML files"
        for file in *.html; do
            mv -- "$file" "${file%%.html}"
        done
    fi
fi

if [[ "$COMMANDS" == *"SPIDER"* ]]; then
    #################################
    # [step3]: run spider template #
    #################################
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "[step3]: running command SPIDER"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    cd $SPIDER_TEMPLATE_HOME
    ./Spider.Console/bin/Debug/netcoreapp3.1/Spider.Console.exe -s "UNIVERSAL--DEFAULT--REG--LEVEL-10" -o "$OUTPUT_PATH" -k true -f "$SP" -u "$URL"
    if [[ "$?" != "0" ]]; then
        echo "run.sh FAILED with run spider template"
        exit 1
    fi
fi

printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
echo "ending run.sh"