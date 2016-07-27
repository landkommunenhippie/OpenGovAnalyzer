var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DTO;
(function (DTO) {
    var HtmlDto = (function () {
        function HtmlDto(type, body) {
            this.type = type;
            this.body = body;
        }
        return HtmlDto;
    }());
    DTO.HtmlDto = HtmlDto;
    var Datasets = (function () {
        function Datasets() {
        }
        return Datasets;
    }());
    DTO.Datasets = Datasets;
    var Dataset = (function () {
        function Dataset() {
        }
        return Dataset;
    }());
    DTO.Dataset = Dataset;
    (function (PageType) {
        PageType[PageType["INDEX"] = 0] = "INDEX";
        PageType[PageType["DETAIL"] = 1] = "DETAIL";
        PageType[PageType["SINGLE_INDEX"] = 2] = "SINGLE_INDEX";
        PageType[PageType["CSV"] = 3] = "CSV";
        PageType[PageType["ERROR"] = 4] = "ERROR";
    })(DTO.PageType || (DTO.PageType = {}));
    var PageType = DTO.PageType;
})(DTO || (DTO = {}));
var Observer;
(function (Observer) {
    var Observable = (function () {
        function Observable() {
            this.observers = [];
        }
        Observable.prototype.registerObserver = function (observer) {
            this.observers.push(observer);
        };
        Observable.prototype.removeObserver = function (observer) {
            this.observers.splice(this.observers.indexOf(observer), 1);
        };
        Observable.prototype.notifyObservers = function (arg) {
            this.observers.forEach(function (observer) {
                observer.update(arg);
            });
        };
        return Observable;
    }());
    Observer.Observable = Observable;
})(Observer || (Observer = {}));
var Parser;
(function (Parser) {
    var DatasetJsonParser = (function () {
        function DatasetJsonParser(fileType) {
            this.wantedFileType = '';
            this.wantedFileType = fileType;
        }
        DatasetJsonParser.prototype.getDownloadUrls = function (datasets) {
            var fileUrls = this.readJson(datasets);
            return fileUrls;
        };
        DatasetJsonParser.prototype.readJson = function (datasets) {
            var nrOfCSVFiles = 0;
            var csvUrls = [];
            for (var index in datasets.results) {
                var dataset = datasets.results[index];
                var tmpArr = this.getCsvFileUrls(dataset);
                for (var i in tmpArr) {
                    csvUrls.push(tmpArr[i]);
                }
            }
            return csvUrls;
        };
        DatasetJsonParser.prototype.getCsvFileUrls = function (dataset) {
            var resourceFormats = dataset.res_format;
            var resourceUrls = dataset.res_url;
            var downloadUrls = [];
            for (var index in resourceFormats) {
                if (resourceFormats[index].toLowerCase() == this.wantedFileType) {
                    if (resourceUrls[index].search(this.wantedFileType) != -1) {
                        downloadUrls.push(resourceUrls[index]);
                    }
                }
            }
            return downloadUrls;
        };
        return DatasetJsonParser;
    }());
    Parser.DatasetJsonParser = DatasetJsonParser;
})(Parser || (Parser = {}));
var Crawler;
(function (Crawler) {
    var OpenGovCrawler = (function () {
        function OpenGovCrawler() {
            var _this = this;
            this.Converter = require('csvtojson').Converter;
            this.fs = require('fs');
            this.request = require('request');
            this.nrOfUrlsInFiles = 0;
            this.nrOfFileUrls = 0;
            this.currentUrl = '';
            this.parsingError = 0;
            this.urlsWorked = [];
            this.urlsFailed = [];
            this.continueRequesting = function (jsonObject) {
                if (_this.downloadUrls.length == 0) {
                    _this.writeResults();
                }
                else {
                    console.log(_this.downloadUrls.length + " more to process.");
                    _this.currentUrl = _this.downloadUrls.shift();
                    setTimeout(_this.requestFile, 0);
                }
            };
            this.requestFile = function () {
                var csvConverter = new _this.Converter({
                    delimiter: 'auto',
                    constructResult: 'true',
                    workerNum: '4'
                });
                csvConverter.on("record_parsed", _this.findUrl);
                csvConverter.on("error", _this.parseError);
                var options = {
                    url: _this.currentUrl,
                    method: 'GET',
                    headers: {
                        'Content-Length': 267386880,
                        'Accept': 'text/csv'
                    },
                    gzip: true,
                    body: "ReadStream"
                };
                _this.request(options).on('error', _this.requestErrorHandler).on('response', _this.responseHandler).on('end', _this.continueRequesting).pipe(csvConverter);
            };
            this.findUrl = function (cellContent) {
                var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
                try {
                    for (var index in cellContent) {
                        var cellContentString = cellContent[index].toString();
                        if (cellContentString && cellContentString.match(urlRegex) != null) {
                            _this.nrOfUrlsInFiles++;
                        }
                    }
                }
                catch (e) {
                    console.log("something went wrong on cell paring", e);
                }
            };
            this.responseHandler = function (resp) {
                _this.urlsWorked.push(_this.currentUrl);
            };
            this.requestErrorHandler = function (err) {
                console.log(err);
                _this.urlsFailed.push(_this.currentUrl);
                _this.writeResults();
                _this.continueRequesting({});
            };
            this.parseError = function (errMsg, errData) {
                console.log("Parsing Failed");
                console.log("Message: ");
                console.log(errMsg);
                console.log("Data: ");
                console.log(errData);
                _this.parsingError++;
                _this.writeResults();
            };
        }
        OpenGovCrawler.prototype.crawlCsvFiles = function () {
            var datasets = JSON.parse(this.fs.readFileSync("files/govData_CSV.json", 'utf8'));
            var jsonParser = new Parser.DatasetJsonParser("csv");
            this.downloadUrls = jsonParser.getDownloadUrls(datasets).slice(0);
            this.nrOfFileUrls = this.downloadUrls.length;
            console.log("Nr of datasets: " + datasets.results.length);
            console.log("Nr Of csv-Files " + this.downloadUrls.length);
            this.currentUrl = this.downloadUrls.shift();
            this.requestFile();
        };
        OpenGovCrawler.prototype.writeResults = function () {
            var infoString = "";
            infoString += this.urlsWorked.length + " of " + this.nrOfFileUrls + "received.\n";
            infoString += this.urlsFailed.length + " RequestErrors.\n";
            infoString += this.parsingError + " ParsingErrors \n";
            infoString += "Found Urls in Files " + this.nrOfUrlsInFiles + "\n";
            infoString += "\nUrls Failed: \n";
            infoString += this.urlsFailed.join('\n');
            console.log(infoString);
            this.fs.writeFile("files/result.txt", infoString);
        };
        return OpenGovCrawler;
    }());
    Crawler.OpenGovCrawler = OpenGovCrawler;
})(Crawler || (Crawler = {}));
var Requester;
(function (Requester) {
    var HttpRequester_DEPR = (function (_super) {
        __extends(HttpRequester_DEPR, _super);
        function HttpRequester_DEPR() {
            var _this = this;
            _super.apply(this, arguments);
            this.request = require('request');
            this.doRequest = function (url, pageType, converter) {
                console.log(converter);
                _this.request.get(url, { timeout: 2000, headers: { 'accept-charset': 'utf8', 'Accept': 'text/csv' } }).pipe(converter);
            };
        }
        HttpRequester_DEPR.prototype.requestFile = function (fileUrl, pageType, converter) {
            return this.doRequest(fileUrl, pageType, converter);
        };
        return HttpRequester_DEPR;
    }(Observer.Observable));
    Requester.HttpRequester_DEPR = HttpRequester_DEPR;
})(Requester || (Requester = {}));
var appArgLength = process.argv.length;
var crawler = new Crawler.OpenGovCrawler();
crawler.crawlCsvFiles();
var Dude = (function () {
    function Dude() {
        this.drink = "White Russian with Milk";
    }
    Dude.prototype.drinks = function () {
        return this.drink;
    };
    return Dude;
}());
var dude = new Dude();
console.log(dude.drinks());
//# sourceMappingURL=app.js.map