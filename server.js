const tok = require('../key.js')
const request = require('request');
const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', function() {
	console.log('ready');
	//client.users.find('tag', 'Talistan#5065').sendMessage('that is martae, the last message is link to a trojan virus, DO NOT click on it, a made a mistake and the bot was temporeraly hacked');
	//client.users.find('tag', 'howdym9s#0211').sendMessage('that is martae, the last message is link to a trojan virus, DO NOT click on it, a made a mistake and the bot was temporeraly hacked');
	//client.users.find('tag', 'Scruffy Lookin\' Nerd Herder#5409').sendMessage('that is martae, the last message is link to a trojan virus, DO NOT click on it, a made a mistake and the bot was temporeraly hacked');
});

client.on('message', function(m) {
	console.log(m.content);
	if (m.content.slice(0,5) == '?roll') {
		Roll(m.content, function(res) {
			m.channel.send(res);
		});
	}
});

client.login(tok.token);

//---------------------------------------------------------------------------------------------------
//dice rolling functions

function rollSet(max, num) {
	//returns promise so callback can be run after all requests are resolved
	return new Promise(function(resolve) {
		//fetches random.org's api to return a list of randomly generated integers
		request(`https://www.random.org/integers/?num=${num}&min=1&max=${max}&col=1&base=10&format=plain&rnd=new`, function(e,r,b) {
			resolve(b
				.split('\n')
				.slice(0,b.split('\n').length-1)
				.map(function(i) {
					return parseInt(i);
				})
			);
		});
	});
}

function sanitiseText(str) {
	str = str.toUpperCase();
	
	//remove any character that isnt a number, D or plus
	str = str.replace(/[^D\d+]/g, '');
	
	//removing whitespaces alongside other characters does not work for some reason
	str = str.replace(/ /g, '');
	
	//remove duplicate characters
	str = str.replace(/D{2,}/g, 'D');
	str = str.replace(/\+{2,}/g, '+');
	
	//remove pluses on ends
	str = str.replace(/^\+|\+$/g, '')
	
	return str;
}

function Roll(str, callback) {
	//sanitises text, then splits them in to each individually calculated partitions
	var vals = sanitiseText(str).split('+');
	
	var res = 0;
	var comps = [];
	
	vals.forEach(function(v) {
		//tests if partition is a roll
		if (/D/g.test(v)) {
			//parses values from partition
			var size = v.split('D')[1];
			var num = v.split('D')[0];
			
			//adds promise to array
			comps.push(rollSet(size, num == '' ? 1 : num));
		} else {
			res += parseInt(v);
		}
	});
	
	//execute when all requests are resolved
	Promise.all(comps).then(function(arrays) {
		var total = 0;
		
		//sum all values in each array
		arrays.forEach(function(array) {
			total += array.reduce(function(a,b) {
				return a + b;
			},0);
		});
		res += total;
		
		callback(res);
	});
}