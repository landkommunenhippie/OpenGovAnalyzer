class Dude{
  drink : string = "White Russian with Milk";
		     
	drinks():string{
		return this.drink;     
			}
										     
}
var dude = new Dude();
console.log(dude.drinks());
