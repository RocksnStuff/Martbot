function rollSet(max, num, fetch) {
	//fetches random.org's api to return a list of randomly generated integers
	https://www.random.org/integers/?num=${num}&min=1&max=${max}&col=1&base=10&format=plain&rnd=new
	res.text.split('\n');
}

function sanitiseText(str) {
	str = str.toUpperCase();
	
	//remove any character that isnt a number, D or plus
	str = str.replace(/[^D\d+]/g, '');
	
	//removing whitespaces alongside other characters does not work for some reason
	str = str.replace(/ /g, '');
	
	return str;
}

function Roll(str) {
	//sanitises text, then splits them in to each individually calculated partitions
	var vals = sanitiseText(str).split('+');
	
	var res = 0;
	
	vals.forEach(function(v) {
		//tests if the partition is a rolled dice
		if (/D/.test(v)) {
			nums = v.split('D');
			
			//parses the second number as the dice size, and the first number as number of rolls
			rollSet(parseInt(nums[1]), parseInt(nums[0])).forEach(function(s) {
				res += parseInt(s);
			});
		} else {
			res += parseInt(v);
		}
		
		return res;
	});
}