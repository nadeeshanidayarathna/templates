#!/usr/bin/env node
'use strict';
const fs = require("fs");
const path = require('path');
const yargs = require('yargs')
    .usage('Usage $0 --url="<URL>" --sp="<STARTPOINT>"')
    .demand('url')
    .describe('url', 'Mention the url to scrape')
    .demand('sp')
    .describe('sp', 'Mention the startpoint class to scrape')
    .demand('path')
    .describe('path', 'Mention the download directory path')
    .argv;

fs.lstat(path.join(__dirname, '../lib', yargs.sp), function () {
    const line = '-'.repeat(process.stdout.columns)
    try {
        console.log(line);
        var scraper;
        try { scraper = require(`../lib/${yargs.sp}`); } catch (e) { }
        if (!scraper) {
            console.error("using generic scraper DOM-RELOCATOR");
            try { scraper = require(`../lib/DOM-RELOCATOR`); } catch (e) { }
        }
        scraper(yargs.url, yargs.sp, yargs.path);
        console.log(line);
    } catch (e) {
        console.error("scraper not found!", e);
        console.log(line);
        process.exit(1);
    }
})