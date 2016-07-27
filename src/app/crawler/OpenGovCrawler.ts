///<reference path="../../typings/request/request.d.ts"/>
///<reference path="../system/system.ts"/> 
///<reference path="parser/DatasetJsonParser.ts"/> 

module Crawler{

export class OpenGovCrawler {
	private Converter = require('csvtojson').Converter;
	private fs = require('fs');
	private request = require('request');
	
	private nrOfUrlsInFiles: number = 0;
	private nrOfFileUrls: number = 0;
	private downloadUrls :string[];
	private currentUrl: string = '';
	private parsingError: number = 0;
	private urlsWorked: string[] = [];
	private urlsFailed: string[] = [];

	constructor(){
		
	}

	
	public crawlCsvFiles(){
		let datasets:DTO.Datasets = JSON.parse(this.fs.readFileSync("files/govData_CSV.json", 'utf8'));
		
		let jsonParser = new Parser.DatasetJsonParser("csv");
		this.downloadUrls = jsonParser.getDownloadUrls(datasets).slice(0);
		this.nrOfFileUrls = this.downloadUrls.length;
		
		console.log("Nr of datasets: " + datasets.results.length);
		console.log("Nr Of csv-Files " + this.downloadUrls.length);
		this.currentUrl = this.downloadUrls.shift(); 
		this.requestFile();
		
	}

	private continueRequesting = (jsonObject) => {
			if(this.downloadUrls.length == 0){
				
				this.writeResults();
			}else{
				console.log(this.downloadUrls.length + " more to process.");
				this.currentUrl = this.downloadUrls.shift();
				setTimeout(this.requestFile, 0 );
			}
	
	}

	private requestFile = () => {


		let csvConverter = new this.Converter({
				
				delimiter:'auto',
				constructResult: 'true',
				workerNum:'4'
			});
		
			//csvConverter.on("end_parsed",this.continueRequesting);
		csvConverter.on("record_parsed",this.findUrl);	
		csvConverter.on("error",this.parseError);
//'Accept-Encoding': 'UTF-8'
		var options = {
			url: this.currentUrl,
			method: 'GET',
			headers: {
				'Content-Length': 267386880,
				'Accept': 'text/csv'
				
			},
			//encoding: 'utf8',
			gzip:true,
			body: "ReadStream"
			};
		//console.log("Request starts");
		this.request(options).on('error', this.requestErrorHandler).on('response', this.responseHandler).on('end', this.continueRequesting).pipe(csvConverter);
		
		//csvConverter = null;
	}

	private findUrl = (cellContent: any) => {
		let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		//console.log("finding url in cells");
		try {
			
			for(let index in cellContent){
				let cellContentString = cellContent[index].toString();
			
				if(cellContentString && cellContentString.match(urlRegex) != null){
					this.nrOfUrlsInFiles++; 
				}
			}
		}catch(e){
			console.log("something went wrong on cell paring",e);
		}
	}

	private responseHandler = (resp) => {
		this.urlsWorked.push(this.currentUrl);
	}

	private requestErrorHandler = (err) => {
			console.log(err);
			this.urlsFailed.push(this.currentUrl);
			this.writeResults();
			this.continueRequesting({});
		}

	private parseError = (errMsg,errData)=>{
		
		console.log("Parsing Failed");
		console.log("Message: ");
		console.log(errMsg);
		console.log("Data: ");
		console.log(errData);
		this.parsingError++;

		this.writeResults();
	}

	private writeResults():void{
		let infoString = "";
		infoString += this.urlsWorked.length + " of " + this.nrOfFileUrls + "received.\n";
		infoString += this.urlsFailed.length + " RequestErrors.\n";
		infoString += this.parsingError + " ParsingErrors \n";
		infoString += "Found Urls in Files " + this.nrOfUrlsInFiles + "\n";
		infoString += "\nUrls Failed: \n"
		infoString += this.urlsFailed.join('\n');
		
		console.log(infoString);
		this.fs.writeFile("files/result.txt",infoString)
	}
}

}
	
