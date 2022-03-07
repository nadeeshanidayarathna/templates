# Spider Ease
- This project is a web scraping CLI application using Node.js and Puppeteer
- Solo service (`soloScraper`) will crawl the given page without crawling inside links
- Recursive service (`recursiveScraper`) will crawl all pages in the given URL recursively by visiting the links

## Installation
All the required node modules have been installed in the project. Use the below command to import node packages

```
npm install
```

## Usage

### 1. To run the solo service for the single page books

Command:
```
npm run solo -- --urls="<URL>" --sp="<STARTPOINT>"
```

Example:
```
npm run solo -- --retry=0 --urls="https://www.statcan.gc.ca/en/about/policy/admin_data" --sp="CA--STATCAN--REG--ADMIN-DATA"
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

### 2. To run the recursive service for the muti page books
<TBD>

## Technologies Used
![Image](https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png)
|
![Image](https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg)

## References
[Public Tutorial Reference](https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer)