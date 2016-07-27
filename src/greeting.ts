/**
 * New typescript file
 */
 class DeveloperGreeting{
 	
 	developer : string = "Heliose"; 
 	greeting : string = "Hello"; 
 	
 	nice : String = "I hope you have a wonderful day! Keep on Coding on me.";
 	
 	greets():string{
 		var border: string  = "######################################################\n\n";
 		return border + this.greeting + " " +  this.developer + "\n" + this.nice + border ;
 	}
 }
 console.log(new DeveloperGreeting().greets());
