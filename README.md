# Spider Ease
- This project is a web scraping CLI application using Node.js and Puppeteer
- Solo service (`soloScraper`) will crawl the given page without crawling inside links

## Installation
All the required node modules have been installed in the project. Use the below command to import node packages

```
npm install
```

## Usage

### 1. To run the solo service for the single page books

Command:
```
npm run solo -- --sp="<STARTPOINT>" --url="<URL>" --path="<DOWNLOAD_PATH>"
```

Example:
```
npm run solo -- --sp="CA--STATCAN--REG--ADMIN-DATA" --url="https://www.statcan.gc.ca/en/about/policy/admin_data" --path="C:\Users\dinusha.ambagahawita\Downloads"
```

Download Folder
```
.\downloads\CA--STATCAN--REG--ADMIN-DATA\
```

Download Files
```
.\downloads\CA--STATCAN--REG--ADMIN-DATA\5b4a8759d60739f644324f2c734493cf0030ca32.html
.\downloads\CA--STATCAN--REG--ADMIN-DATA\5b4a8759d60739f644324f2c734493cf0030ca32
.\downloads\CA--STATCAN--REG--ADMIN-DATA\index.html
```

- `5b4a8759d60739f644324f2c734493cf0030ca32.html` original HTML file download

- `5b4a8759d60739f644324f2c734493cf0030ca32` recreated HTML file matching with sha1 converted filename

- `index.html` easy viewer file to view the recreated HTML on the browser

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
bash run.sh "CA--STATCAN--REG--ADMIN-DATA" "https://www.statcan.gc.ca/en/about/policy/admin_data" "C:\Users\dinusha.ambagahawita\Downloads" "C:\Users\dinusha.ambagahawita\projects\git\spider.ease" "C:\Users\dinusha.ambagahawita\projects\git\spider.templates"
```

## Technologies Used
![Image](https://static.javatpoint.com/images/javascript/javascript_logo.png)
![Image](https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png)
![Image](https://miro.medium.com/max/600/1*AJTB4eViV7eQeOC9uUGABw.png)

## References
[Public Tutorial Reference](https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer)