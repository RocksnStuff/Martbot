const tok = require('../key.js')
const request = require('request');
const Discord = require('discord.js');
const client = new Discord.Client();

var songState = false;
var stateCount = 0;
var lyrics;

client.once('ready', function() {
	console.log('ready');
	
	getLyrics('revenge.txt');
});

client.on('message', function(m) {
	console.log(m.content);
	
	if (m.content.slice(0,5) == '?roll') {
		Roll(m.content, function(res) {
			m.channel.send(res);
		});
	}
	
	if ( (sanitiseTextCreeper(m.content) == 'CREEPER' && !songState) || (songState && m.author != client.user) ) {
		songState = true;
		
		runSong(m.content, m.channel);
	}
});

client.login(tok.token);

//---------------------------------------------------------------------------------------------------
//revenge singer functions

function sanitiseTextCreeper(str) {
	str = str.toUpperCase();
	
	//remove all characters that arnt capital letters
	str = str.replace(/[^A-Z]+/g, '');
	
	return str;
}

function getLyrics(src) {
	const fs = require('fs');
	
	fs.readFile(src, 'ascii', function(err, data) {
		lyrics = data.split('\r\n');
	});
}

function runSong(msg, chn) {
	
	msg = sanitiseTextCreeper(msg);
	
	if ( msg == sanitiseTextCreeper(lyrics[stateCount]) ) {
		if (stateCount == lyrics.length - 1) {
			chn.send('Congrations you done it');
			
			songState = false;
			
			stateCount = 0;
			
			return;
		}
		
		chn.send(lyrics[stateCount + 1]);
		
		stateCount += 2;
		
		if (stateCount == lyrics.length) {
			chn.send('Congrations you done it');
			
			songState = false;
			
			stateCount = 0;
		}
	} else {
		songState = false;
		
		chn.send('Fucking kill yourself cunt');
		
		stateCount = 0;
	}
	
	console.log(stateCount);
}

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

function sanitiseTextDice(str) {
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
	var vals = sanitiseTextDice(str).split('+');
	
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