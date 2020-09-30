require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const PREFIX = '!'; // Prefix used to invoke commands
const TOKEN = process.env.TOKEN;
const TOKEN2 = process.env.NitraToken;
const servUser = process.env.ID2;
const servID = process.env.ID1;
const { isNull } = require('util');
const mongoose = require('mongoose');
const allUsers = [];
const axios = require('axios');
const path = require('path');
var moment = require('moment-timezone');
var data = [];
var data2 = [];
var tRef = 0;
var feedStart = Boolean;
var readline = require('readline');
const { createSecureServer } = require('http2');
const { triggerAsyncId } = require('async_hooks');
const { toASCII } = require('punycode');
var phrase1 = ">) killed by ";
var phrase2 = " is connected (";
var phrase3 = ") has been disconnected";
var today = new Date();


bot.on('message', async message=> {
	let args = message.content.substring(PREFIX.length).split(" ");
	const ausername =  message.author.username;
    const auserId = message.member.id;
    const guildId = message.guild.id;
    const guildName = message.guild.name;
    const tuserId = Discord.User.id;
	const members = message.guild.members.cache;
	
	switch(args[0]){			
		// Clear Messages (Owner and Admin Perms Only )
		case 'clear':
			if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
			if (!args[1]) return message.reply('Error, please define number of messages to clear') .then (msg => msg.delete(5000))
			if (args[1] > 50) return message.channel.send('The max number of messages you can delete is 50') .then (msg => msg.delete(5000))
			if (isNaN(args[1])) return message.channel.send('You must use a number!') .then (msg => msg.delete(5000))
		    message.channel.bulkDelete(args[1])			
		break;

		//Start K1llFeed (Owner and Admin perms only)
		case 'k1llfeed':
			if (!args[1]) return message.channel.send("Missing Server Argument!").then (message => message.delete({ timeout: 5000, }));
			if (args[1] === 'PAUSE') {
                if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
                feedStart = false;
                return;
            }
            if (args[1] === 'RESUME') {
                if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
                feedStart = true;
                return;
            } 
			if (args[1] === 'START'){
				if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
				feedStart = true;
				setInterval(function() {
					if (feedStart === true) {
						axios.get('https://api.nitrado.net/ping')
						.then((res) => {
							if(res.status >= 200 && res.status < 300) {
								async function downloadFile () {
									// This function will request file that will contain download link for log
									const url1 = 'https://api.nitrado.net/services/'
									const url2 = '/gameservers/file_server/download?file=/games/'
									const url3 = '/noftp/dayzxb/config/DayZServer_X1_x64.ADM'
									const filePath = path.resolve('./logs', 'serverlog.ADM')
									const writer = fs.createWriteStream(filePath)
									const response = await axios.get(url1+`${servID}`+url2+`${servUser}`+url3,{ responseType: 'stream',  headers: {'Authorization' : 'Bearer '+`${TOKEN2}`, 'Accept': 'application/octet-stream'}})
									response.data.pipe(writer)
									return new Promise((resolve, reject) => {
										writer.on('finish', resolve)
										writer.on('error', reject)
									})					
								}
								downloadFile();
							}
								
						})
						.catch(function (error) {
							console.log(error);
						});	
						
						// Create a readable stream in order to parse log download link form file
						var rl = readline.createInterface({
							input: fs.createReadStream('./logs/serverlog.ADM')
 						});

						//Handle Stream events ---> data, end, and error// This will request download link and write result to new file
						rl.on('line', function (line) {
							const newURL = line.substr(44,91);
							axios.get(newURL)
							.then((res) => {
								const _log = res.data;
								fs.writeFile('./logs/log.ADM', _log, 'utf-8', (err) =>{
									if (err) throw err;
									console.log('Log Saved!')
								})				
							})			
						});
						rl.on('close', function() {
							return data;
						})
				
						rl.on('error', function(err) {
							console.log(err.stack);
						});

						// Create new readable stream// This will read new log file in order to parse k1llfeed data.
						var rl = readline.createInterface({
							input: fs.createReadStream('./logs/log.ADM')
			 			});
			 
			 			//Handle Stream events ---> data, end, and error// parses data for each line then passes data.
			 			rl.on('line', function (line) {
							if (line.includes(phrase1, 0)) {
								data.push(line.split(/[|"'<>()]/));
							}
			 			});
			 
			 			rl.on('close', function() {
							return data;
			 			})
			 
			 			rl.on('error', function(err) {
							console.log(err.stack);
			 			});

						console.log(data);
						if (data) {
							for(let i = 0; i < data.length; i++){
								data2.push(data[i]);
								for ( val of data2){
									if (val[11]){
										var f0 = val[0].toString();
										var f1 = val[10].toString();
										var f2 = val[2].toString();
										var f3 = val[15].toString();
										let f0a = f0.split(":")
										let dt = new Date();
										function getDate() {
											dt.setHours(f0a[0]);
											dt.setMinutes(f0a[1]);
											dt.setSeconds(f0a[2]);
											dt.setHours(dt.getHours() - 5);
										}
										getDate();
										data2.splice(0, data2.length);
										let dt0 = Math.round(dt.getTime() / 1000);
										console.log(dt0);

										if(dt0 != tRef && dt0 > tRef) {
											const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
											const embed = new Discord.MessageEmbed()
											.attachFiles(attachment)
											.setThumbnail('attachment://crown.png')
											.setColor(0xDD0000)
											.setTitle('K1llFeed Notification')
											.setDescription(`${f0} **${f1}** Killed **${f2}** ${f3} `)
											message.channel.send(embed).then (message => message.delete({ timeout: 180000, }));
											tRef = dt0;
										}else {
											return;
										}
									}else {
										var f4 = val[0].toString();
										var f5 = val[2].toString();
										var f6 = val[9].toString();
										let f4a = f4.split(":");
										let dt = new Date();
										function getDate() {
											dt.setHours(f4a[0]);
											dt.setMinutes(f4a[1]);
											dt.setSeconds(f4a[2]);
											dt.setHours(dt.getHours() - 5);
										}
										getDate();
										data2.splice(0, data2.length);
										let dt0 = Math.round(dt.getTime() / 1000);
										if(dt0 != tRef && dt0 > tRef) {
											const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
											const embed = new Discord.MessageEmbed()
											.attachFiles(attachment)
											.setThumbnail('attachment://crown.png')
											.setColor(0xDD0000)
											.setTitle('K1llFeed Notification')
											.setDescription(`${f4} **${f5}** was ${f6} `)
											message.channel.send(embed).then (message => message.delete({ timeout: 180000, }));
											tRef = dt0;
										}else {
											return;
										}
									}
								}
							}
						}else {
							console.log('No Change!');
							data2.splice(0, data.length);
							data.splice(0, data.length);
							console.log("Program Ended");
						}
						data.splice(0, data.length);
						data2.splice(0, data2.length);
					}else {
                        console.log("K1llfeed Paused!");
						return;
					}
				}, 10000);
		    }		
		break;
	}
})	

//Login Discord Bot
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
})

bot.on('ready', () => {
	console.log('K1llfeed is Active!');
})