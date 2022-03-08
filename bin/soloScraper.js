#!/usr/bin/env node
'use strict';
const fs = require("fs");
const path = require('path')
const yargs = require('yargs')
    .usage('Usage $0 --url=["<URL>"] --sp="<STARTPOINT>"')
    .demand('url')
    .describe('url', 'Mention the url to scrape')
    .demand('sp')
    .describe('sp', 'Mention the startpoint class to scrape')
    .argv

let soloScraper
fs.lstat(path.join(__dirname, '../lib', yargs.sp), function (err, stat) {
    if (err) {
        console.log("solo scraper for the particular domain is not available")
        process.exit(0)
    }
    if (!stat.isDirectory()) {
        console.log("solo scraper for the particular domain is not available")
        process.exit(0)
    }
    soloScraper = require(`../lib/${yargs.sp}/soloScraper`)
    soloScraper(yargs.url, yargs.sp)
})