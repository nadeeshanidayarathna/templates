# Puppeteer Scraper

- This project is a web scraping CLI application using Node.js and Puppeteer.
- This will also crawl recursively by using CSS selectors for the sample URL as command line argument.
- Main service(recursiveScraper) will crawl all pages in the given URL recursively by visiting to links
- Solo service(soloScraper) will crawl the given array of pages without crawling inside links


## Installation

All the required node modules has been installed to the project. Use below commands

to import node packages

```
npm install
```


## Usage

The CLI tool can be installed globally using 
```npm i -g``` or ```npm link```
To remove use the command,
```npm uninstall -g``` or ```npm unlink```


#### 1. To run the main service

* If installed globally, use the following command,
```
recursiveScraper --url="<URL>" --css="<DOMAIN>"
```
* If not installed globally, you can still run the scripts using,
```
npm run recursive -- --url="<URL>" --css="<DOMAIN>"
```

e.g.
```
npm run recursive -- --retry=3 --url="https://govt.westlaw.com/mdc/Browse/Home/Maryland/MarylandCodeCourtRules?guid=N34273650A5AA11DB9BCF9DAC28345A2A&originationContext=documenttoc&transitionType=Default&contextData=(sc.Default)" --css="govt.westlaw.com"
```
Files will get downloaded to folder
```
.\downloads\7424df04b3fec24ad60c3b024744ed5c89a39eeb\
```

#### 2. To run the solo service

* If installed globally, use the following command,
```
soloScraper --urls="<URL>" "<URL>" --css="<DOMAIN>"
```
* If not installed globally, you can still run the scripts using,
```
npm run solo -- --urls="<URL>" "<URL>" --css="<DOMAIN>"
```

e.g.
```
npm run solo -- --retry=3 --urls="https://govt.westlaw.com/mdc/Browse/Home/Maryland/MarylandCodeCourtRules?guid=N34273650A5AA11DB9BCF9DAC28345A2A&originationContext=documenttoc&transitionType=Default&contextData=(sc.Default)" "https://foobar.com" --css="govt.westlaw.com"
```
Files will get downloaded to folder
```
.\downloads\7424df04b3fec24ad60c3b024744ed5c89a39eeb\
```

Files will get downloaded to folder
```
.\downloads\
```

## Technologies Used
![Image](https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png)
|
![Image](https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg)

## References
[Public Tutorial Reference](https://www.digitalocean.com/community/tutorials/how-to-scrape-a-website-using-node-js-and-puppeteer)