# Spider Ease
- This project is a web scraping CLI application using `Node.js` and `Puppeteer`
- The scraper service (`scraper`) will scrape the given page via the JS template available in the `lib` folder

## Installation
All the required node modules have been installed in the project. Use the below command to import node packages

```
npm install
```
## Features
- Run the `JS` scrapers to perform rule base HTML simplification to match the universal `C#` template
- Run the `JS` simplification both offline and online modes with local cache
- Browser level debugging ability to put the breakpoints on actual eval functions
- Tryout the code in the browser developer console before creating the `JS` template
- Run the full pipeline if required at the end (`JS Conversion` + `Universal Template Caller` + `Spidering Output`)
- JS templates are located in the `lib` folder with the SP code standard. Example: `.\lib\CA--STATCAN--REG--ADMIN-DATA.js`
 
## Usage

### 1. To run the scraper service for the single page books

Command:
```
npm run scraper -- --sp="<STARTPOINT>" --url="<URL>" --path="<DOWNLOAD_PATH>"
```

Example:
```
npm run scraper -- --sp="CA--STATCAN--REG--ADMIN-DATA" --url="https://www.statcan.gc.ca/eng/about/policy/admin_data" --path="C:\Users\dinusha.ambagahawita\Downloads"
```

Download Folder
```
.\downloads\CA--STATCAN--REG--ADMIN-DATA\
```

Download Files
```
.\downloads\CA--STATCAN--REG--ADMIN-DATA\cccf739ae90f8a898e62c13c28b630d9db4bc6d1_original.html
.\downloads\CA--STATCAN--REG--ADMIN-DATA\cccf739ae90f8a898e62c13c28b630d9db4bc6d1.html
```

- `cccf739ae90f8a898e62c13c28b630d9db4bc6d1_original.html` original HTML file downloaded with URL `SHA-1` filename

- `cccf739ae90f8a898e62c13c28b630d9db4bc6d1.html` recreated HTML file matching with URL `SHA-1` filename

### 2. To run the entire spidering pipeline in local which does below steps
- Clear output folder
- Run spider ease
- Run spider prepare
- Run spider template

Command:
```
bash run.sh "<STARTPOINT>" "<URL>" "<OUTPUT_FOLDER>" "<SPIDER_EASE_HOME>" "<SPIDER_TEMPLATE_HOME>"
```

Example:
```
bash run.sh "CA--STATCAN--REG--ADMIN-DATA" "https://www.statcan.gc.ca/eng/about/policy/admin_data" "C:\Users\dinusha.ambagahawita\Downloads" "C:\Users\dinusha.ambagahawita\projects\git\spider.ease" "C:\Users\dinusha.ambagahawita\projects\git\spider.templates"
```

## Simplified HTML Style Standards
- Root title
- Issue date
- Effective date
- Levels 1-10

---
Style Guide:
![Screenshot](colors.png)
---
Example:
![Screenshot](sample.png)
---

## Technologies Used
![Image](https://static.javatpoint.com/images/javascript/javascript_logo.png)
![Image](https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png)
![Image](https://miro.medium.com/max/600/1*AJTB4eViV7eQeOC9uUGABw.png)

## References
[Public Tutorial Reference](https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer)