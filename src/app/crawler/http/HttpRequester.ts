///<reference path="../../../typings/request/request.d.ts"/>
///<reference path="../../system/system.ts"/> 


module Requester{

export class HttpRequester_DEPR extends Observer.Observable{
	protected request = require('request');
	

	public requestFile(fileUrl: string,pageType: DTO.PageType, converter:any):any{
		return this.doRequest(fileUrl, pageType, converter);
	}


	protected doRequest = (url: string, pageType: DTO.PageType,converter:any): any => {
		console.log(converter);
		this.request.get(url,{timeout:2000, headers:{'accept-charset':'utf8', 'Accept':'text/csv'}}).pipe(converter);
		
		
		/*{
			
			if(error || !(response.statusCode == 200) ){
				console.log("Error");
				console.log(error);
				//console.log("Response");
				//console.log(response);
				console.log("Url");
				console.log(url);
				console.log("Attempts: " + attempts);
				
				if(attempts < 1){
					this.doRequest(url, pageType ,attempts+1);
				}else{
					let htmlDto = new DTO.HtmlDto(DTO.PageType.ERROR, body);
					super.notifyObservers(htmlDto);	
				}
			
			}else{
				var htmlDto = new DTO.HtmlDto(pageType, body);
				super.notifyObservers(htmlDto);
			}
			});*/
			
	}
}

}
