'use strict'
const { flatten } = require("lodash");
const { deleteMessages, writeMessagesToTelegram, cleanUpOldChat } = require("./telegram-api");
const { PuneDistrictId, DelhiStateId, NcrAdditionalDistricts } = require("./constants");
const { getTomorrowDateString } = require("./helpers");
const { getDistricts, getWeeklyCalByIdAndDate } = require("./cowin-api");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const TelegramData = require('../data/telegram.json')
const { DelhiChatId, PuneChatId } = TelegramData;

let skippedDeletionDelhi = 0;
let skippedDeletionPune = 0;

var districtList = [];
var dateToQuery = undefined;
var oldDelhiMessage = [];
var oldPuneMessage = [];

const DistrictNamesMap = new Map();
DistrictNamesMap.set(PuneDistrictId, 'Pune');

NcrAdditionalDistricts.forEach(p => {
    if (!DistrictNamesMap.has(p.district_id)) {
        DistrictNamesMap.set(p.district_id, p.district_name);
    }
});

(function setDate() {
    if (dateToQuery !== undefined) {
        return;
    }
    dateToQuery = getTomorrowDateString();
})();

async function initDistrictsOfDelhi() {

    if (districtList != undefined && districtList.length > 0) { return; }
    try {
        const responseList = await getDistricts(DelhiStateId);
        responseList.forEach(p => {
            if (!DistrictNamesMap.has(p.district_id)) {
                DistrictNamesMap.set(p.district_id, p.district_name);
            }

        });
        districtList = responseList.concat(NcrAdditionalDistricts);
    }
    catch (err) {
        console.error(`Error while getting stateList Status: ${err.response.status}`, err.response.data);
    }
}


async function getWeeklyCalendarDelhiNcr() {
    // cleanUpOldChat(DelhiChatId, 1340, 1500).then(() => { console.log('clean up Done'); }).catch(() => { console.log('clean up failed'); });
    try {
        await initDistrictsOfDelhi();
        console.log('calling for Delhi NCR');
        const allValidHospitals = await Promise.all(
            districtList.map(p => {
                return getWeeklyCalByIdAndDate(p.district_id, dateToQuery, 18);
            }));
        const cleansedArray = flatten(allValidHospitals.filter(p => p !== undefined || p !== null));
        if (cleansedArray !== undefined && cleansedArray.length > 0) {
            console.log(JSON.stringify({ hospitals: cleansedArray }));
            const oldIds = await writeMessagesToTelegram(DelhiChatId, cleansedArray)
            console.log("Write to telegram Delhi", oldIds);
            oldDelhiMessage = oldDelhiMessage.concat(oldIds);
        }
        else {
            if (oldDelhiMessage !== undefined && oldDelhiMessage.length > 0 && skippedDeletionDelhi > 5) {
                const clonedArray = [...oldDelhiMessage];
                oldDelhiMessage = [];
                // await deleteMessages(DelhiChatId, clonedArray);
                skippedDeletionDelhi = 0;
            }
            else {
                skippedDeletionDelhi += 1;
            }
        }
    }
    catch (ex) {
        console.log('failed to get getWeeklyCalendarDelhiNcr');
    }
}
async function getWeeklyCalendarPune() {
    try {
        console.log('calling for Pune');
        const allValidHospitals = await getWeeklyCalByIdAndDate(PuneDistrictId, dateToQuery);
        if (allValidHospitals !== undefined && allValidHospitals.length > 0) {
            console.log(JSON.stringify({ pune_hospitals: allValidHospitals }));
            const ids = await writeMessagesToTelegram(PuneChatId, allValidHospitals)
            console.log("Write to telegram Pune", ids);
            oldPuneMessage = oldPuneMessage.concat(ids);
            skippedDeletionPune = 0;
        } else {
            if (oldPuneMessage !== undefined && oldPuneMessage.length > 0 && skippedDeletionPune > 5) {
                const clonedArray = [...oldPuneMessage];
                oldPuneMessage = [];
                // await deleteMessages(PuneChatId, clonedArray);
                skippedDeletionPune = 0;
            }
            else {
                skippedDeletionPune += 1;
            }
        }
    }
    catch (ex) {
        console.log('failed to get getWeeklyCalendarPune');
    }
}

async function startCowinScrapping() {
    const p1 = getWeeklyCalendarPune();
    const p2 = getWeeklyCalendarDelhiNcr();
    return await Promise.all([p1, p2]);
}

var closeTimeout = false;
let timerId = setTimeout(function schedule() {
    startCowinScrapping().
    catch("Error while running start").
    finally(
        () => {
            if (!closeTimeout) {
                timerId = setTimeout(schedule, 1 * 60 * 1000);
            }
        }
    );
}, 0)


readline.question('Press any key to close?', () => {
    closeTimeout = true;
    clearTimeout(timerId);
    console.log(`Closing app!!`);
    readline.close();
});







