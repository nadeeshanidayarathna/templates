echo "calling run.sh"

# execution specific variables
export SP="$1"
export URL="$2"

# fixed variables
export OUTPUT_PATH="C:\Users\dinusha.ambagahawita\projects\git\spider.ease\downloads"
export SPIDER_EASE_HOME="C:\Users\dinusha.ambagahawita\projects\git\spider.ease"
export SPIDER_TEMPLATE_HOME="C:\Users\dinusha.ambagahawita\projects\git\spider.templates"

#########################
# step1: run spider ease
#########################
echo "step1: run spider ease"
cd $SPIDER_EASE_HOME
npm install
npm run solo -- --retry=0 --urls="$URL" --sp="$SP"

############################
# step2: run spider prepare
############################
echo "step2: run spider prepare"
cd $OUTPUT_PATH/$SP
if compgen -G "*.html" > /dev/null; then
    for file in *.html; do
        mv -- "$file" "${file%%.html}"
    done
fi

##############################
# step3: run spider templates
##############################
echo "step3: run spider templates"

echo "ending run.sh"