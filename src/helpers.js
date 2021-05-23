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

const getQueryDateString = () => {
    var today = new Date();
    const queryDate = new Date(today);
    if(queryDate.getHours() > 14 )
    {
        queryDate.setDate(queryDate.getDate() + 1)
    }   

    var dd = queryDate.getDate();
    var mm = queryDate.getMonth() + 1;
    var yyyy = queryDate.getFullYear();
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
    getQueryDateString
}


