const sleep = require('util').promisify(setTimeout);
const eris = require('eris');
const moment = require('moment');
const config = require('./config.js');
const fs = require('fs')

const client = new eris.Client(config.token)

async function start() {
    for(; ;) {
        await sleep(config.timeTillRecount);
        let message = '';
        for(let input of config.dates) {
            let startDate = moment(new Date());
            let endDate = moment(new Date(input.date));
            let seconds = moment(endDate).diff(startDate, 's');
    
            if(seconds > 0) {
                message = message + input.text
                .replace('{1}', seconds)
                .replace('{2}', (seconds / 60).toFixed(1))
                .replace('{3}', (seconds / 60 / 60).toFixed(1))
                .replace('{4}', (seconds / 60 / 60 / 24).toFixed(1))
                .replace('{5}', (seconds / 60 / 60 / 24 / 7).toFixed(1))
                .replace('{6}', moment(endDate).diff(startDate, 'months'))
            }
            
            if(seconds <= 0) {
                message = message + input.endText
            }
        }
        message = message + config.endText

        let data = fs.readFileSync('./temp.cliv').toString().split(' ');
        client.editMessage(data[0], data[1], `${message}`)
    }
};

client.on('ready', async() => {
    if(!fs.existsSync('./temp.cliv') || fs.readFileSync('./temp.cliv') === '') {
        let data = '';

        if(!config.channelID) return console.log('Не указан ID канала в config\'е');

        data = data + config.channelID

        let m = await client.createMessage(config.channelID, 'Тестовое сообщение ДО его редактирования.')
        data = data + ` ${m.id}`

        fs.writeFileSync('./temp.cliv', data);
    }

    client.editStatus("idle", { name: 'за временем..', type: 3 });
    start();
});

client.connect();