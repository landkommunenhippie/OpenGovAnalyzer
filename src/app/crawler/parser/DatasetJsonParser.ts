///<reference path="../../system/system.ts" />

module Parser{
export class DatasetJsonParser{
    private wantedFileType:string = '';


    constructor(fileType:string){
        this.wantedFileType = fileType;
    }

    public getDownloadUrls(datasets:DTO.Datasets):string[]{
        
		let fileUrls = this.readJson(datasets);
		return fileUrls;
    }

    private readJson(datasets:DTO.Datasets):string[] {
		let nrOfCSVFiles = 0; 
		let csvUrls :string[] = [];
		for (let index in datasets.results){
			
			let dataset: DTO.Dataset = datasets.results[index];
			let tmpArr = this.getCsvFileUrls(dataset);
			for(let i in tmpArr){
				csvUrls.push(tmpArr[i]);
			}
			
		}
		
        return csvUrls;
		
	}

	private getCsvFileUrls(dataset: DTO.Dataset): string[]{
		let resourceFormats: string[] = dataset.res_format;
		let resourceUrls: string[] = dataset.res_url;
		
		let downloadUrls:string[] = [];
		
		for(let index in resourceFormats){
			if(resourceFormats[index].toLowerCase() == this.wantedFileType){
				if(resourceUrls[index].search(this.wantedFileType) != -1){
					downloadUrls.push(resourceUrls[index]);
				}		
			}
		}
		
		return downloadUrls;
	}
}
}