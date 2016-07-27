///<reference path="crawler/OpenGovCrawler.ts"/>  

var appArgLength: number = process.argv.length;

let crawler: Crawler.OpenGovCrawler = new Crawler.OpenGovCrawler();
crawler.crawlCsvFiles();
