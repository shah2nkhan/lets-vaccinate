"use strict";
const { flatten } = require("lodash");
const { deleteMessages, writeMessagesToTelegram, cleanUpOldChat } = require("./telegram-api");
const { PuneDistrictId, DelhiStateId, NcrAdditionalDistricts, DistrictNamesMap } = require("./constants");
const { getQueryDateString, sleep } = require("./helpers");
const { getDistricts, getWeeklyCalByIdAndDate } = require("./cowin-api");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const TelegramData = require('../data/telegram.json')
const { DelhiChatId, PuneChatId } = TelegramData;

let skippedDelhiTelegramCleanupCount = 0;
let skippedPuneTelegramCleanupCount = 0;

var closingApp = false;

var DelhiNcrDistrictList = [];
var dateToQuery = undefined;
var delhiTelegramMessageId = [];
var puneTelegramMessageId = [];

DistrictNamesMap.set(PuneDistrictId, 'Pune');

NcrAdditionalDistricts.forEach(p => {
    if (!DistrictNamesMap.has(p.district_id)) {
        DistrictNamesMap.set(p.district_id, p.district_name);
    }
});

(function setDate() {
    dateToQuery = getQueryDateString();
})();

async function initDistrictsOfDelhi() {
    if (DelhiNcrDistrictList != undefined && DelhiNcrDistrictList.length > 0) { return; }
    try {
        const responseList = await getDistricts(DelhiStateId);
        responseList.forEach(p => {
            if (!DistrictNamesMap.has(p.district_id)) {
                DistrictNamesMap.set(p.district_id, p.district_name);
            }

        });
        DelhiNcrDistrictList = responseList.concat(NcrAdditionalDistricts);
    }
    catch (err) {
        console.error(`Error while getting stateList Status: ${err.response.status}`, err.response.data);
    }
}


async function getWeeklyCalendarDelhiNcr() {
    //return Promise.resolve();
    // cleanUpOldChat(DelhiChatId, 1340, 1500).then(() => { console.log('clean up Done'); }).catch(() => { console.log('clean up failed'); });
    try {
        await initDistrictsOfDelhi();
        console.log('calling for Delhi NCR', new Date().toLocaleString());
        var hasVaccineSlots = false;

        for (const district of DelhiNcrDistrictList) {
            const districtHospitalsWithVaccines = await sleep(2000).then(v => {
                getWeeklyCalByIdAndDate(district.district_id, dateToQuery, 18)
            });

            if (districtHospitalsWithVaccines !== undefined && districtHospitalsWithVaccines !== null
                && Array.isArray(districtHospitalsWithVaccines) && districtHospitalsWithVaccines.length > 0) {

                hasVaccineSlots = hasVaccineSlots | true;
                console.log(JSON.stringify({ 'Hospitals': districtHospitalsWithVaccines }));
                const oldIds = await writeMessagesToTelegram(DelhiChatId, districtHospitalsWithVaccines)
                console.log("Write to telegram Delhi", oldIds);
                delhiTelegramMessageId = delhiTelegramMessageId.concat(oldIds);
            }
        }

        if (!hasVaccineSlots) {
            if (skippedDelhiTelegramCleanupCount > 5) {
                const clonedArray = [...delhiTelegramMessageId];
                delhiTelegramMessageId = [];
                // await deleteMessages(DelhiChatId, clonedArray);
                skippedDelhiTelegramCleanupCount = 0;
            }
            else {
                skippedDelhiTelegramCleanupCount += 1;
            }
        }
    }
    catch (ex) {
        console.log('failed to get getWeeklyCalendarDelhiNcr');
    }
}
async function getWeeklyCalendarPune() {
    try {
        console.log('calling for Pune', new Date().toLocaleString());
        const allValidHospitals = await getWeeklyCalByIdAndDate(PuneDistrictId, dateToQuery);
        if (allValidHospitals !== undefined && allValidHospitals.length > 0) {
            console.log(JSON.stringify({ pune_hospitals: allValidHospitals }));
            const ids = await writeMessagesToTelegram(PuneChatId, allValidHospitals)
            console.log("Write to telegram Pune", ids);
            puneTelegramMessageId = puneTelegramMessageId.concat(ids);
            skippedPuneTelegramCleanupCount = 0;
        } else {
            if (puneTelegramMessageId !== undefined && puneTelegramMessageId.length > 0 && skippedPuneTelegramCleanupCount > 5) {
                const clonedArray = [...puneTelegramMessageId];
                puneTelegramMessageId = [];
                // await deleteMessages(PuneChatId, clonedArray);
                skippedPuneTelegramCleanupCount = 0;
            }
            else {
                skippedPuneTelegramCleanupCount += 1;
            }
        }
    }
    catch (ex) {
        console.log('failed to get getWeeklyCalendarPune');
    }
}

let dateTimerId = setTimeout(function scheduleTimeChange() {
    dateToQuery = getQueryDateString();
    if (!closingApp) {
        dateTimerId = setTimeout(scheduleTimeChange, 6 * 60 * 60 * 1000);
    }
}, 6 * 60 * 60 * 1000);

async function startCowinScrapping() {
    const p1 = getWeeklyCalendarPune();
    const p2 = getWeeklyCalendarDelhiNcr();
    return Promise.all([p1, p2]);
}

let dataTimerId = setTimeout(function schedule() {
    startCowinScrapping().
        catch("Error while running start").
        finally(
            () => {
                if (!closingApp) {
                    dataTimerId = setTimeout(schedule, .75 * 60 * 1000);
                }
            }
        );
}, 0);


readline.question('Press any key to close?', () => {
    closingApp = true;
    clearTimeout(dataTimerId);
    clearTimeout(dateTimerId);
    console.log(`Closing app!!`);
    readline.close();
});







