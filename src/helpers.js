'use strict'
const { startCase } = require("lodash");
const { NewlineChar } = require("./constants");

const buildFormattedString = (hospitalDetails) => {
    const { sessions, ...rest } = hospitalDetails;
    const mainHeadersKeys = Object.keys(rest);
    let mainHeaderString = "";
    mainHeadersKeys.forEach(key => {
        mainHeaderString += `${NewlineChar}${startCase(key)} = ${rest[key]}`;
    });
    let sessionsString = ``;
    if (sessions.length > 0) {
        let sessionStrings = sessions.map((ses, index) => {
            let sessionString = sessions.length === 1 ? "Session:" : `Session ${index + 1}:`;
            const sessionKeys = Object.keys(ses);
            sessionKeys.forEach(key => sessionString += `${NewlineChar} ${startCase(key)} = ${ses[key]}`);
            return sessionString;
        });
        sessionStrings.forEach(p => sessionsString += `${p}${NewlineChar}`);
    }
    return `${mainHeaderString}${NewlineChar}${sessionsString}`;
}

const getTomorrowDateString = () => {
    var today = new Date();
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    var dd = tomorrow.getDate();

    var mm = tomorrow.getMonth() + 1;
    var yyyy = tomorrow.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    return dd + '-' + mm + '-' + yyyy;
}

module.exports = {
    buildFormattedString,
    getTomorrowDateString
}


