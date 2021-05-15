'use strict'
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const { head, filter, flatten } = require('lodash');
var fs = require('fs')

// let db = new sqlite3.Database('./data/vaccineTracker.db', sqlite3.OPEN_READWRITE, (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log('Connected to the database.');
//   });

// fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states' ,
// { 
//     method: 'GET',
//     headers: { 'Accept': 'application/json', 'User-Agent': 'android' },

// } ) // rejects
//   .then(response => response.json())
//   .then (data => console.log(data))
//   .catch(err => console.log(err)) 

var state_id = 9;
var districtList = [];
var dateToQuery = undefined;


function writeDataIntoFile(ObjArr) {
    fs.appendFile('./data/vaccineTracker.json', JSON.stringify(ObjArr), { flag: "a+" }, function (err) {
        if (err) { console.log('fail to Save!', err); }
    });
}

async function getDistricts(id) {
    try {
        const respose = await axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${id}`,
            {
                headers: {
                    accept: "application/json",
                    'User-Agent': 'android'
                }
            })

        return respose.data.districts;
    } catch (err) {
        console.error('Error while getting Districts', err)
    }
}

async function initStates() {
    if (districtList != undefined && districtList.length > 0) { return; }
    try {
        const respose = await axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/states',
            {
                headers: {
                    accept: "application/json",
                    'User-Agent': 'android'
                }
            })
        state_id = head(filter(respose.data.states, p => { p.state_name === "Delhi" }))?.state_id || 9;
        districtList = await getDistricts(state_id);
    }
    catch (err) {
        console.error('Erro while getting state', err)
    }
}

function setDate() {
    if (dateToQuery !== undefined) {
        return;
    }
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
    dateToQuery = dd + '-' + mm + '-' + yyyy;
}

async function getWeeklyCalByIdAndDate(id, date) {
    try {
        const respose = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${id}&date=${date}`,
            {
                headers: {
                    accept: "application/json",
                    'User-Agent': 'android'
                }
            })

        const validHospitalDetails = []
        respose.data.centers.forEach
            (
                p => {
                    // "available_capacity": 0,
                    // "min_age_limit": 45,
                    const validSessions = filter(p.sessions, ses => {
                        return ses.available_capacity_dose1 > 1 && ses.min_age_limit === 18 && ses.vaccine === 'COVISHIELD'
                    });

                    if (validSessions !== undefined && validSessions.length > 0) {
                        const { name, address } = p
                        validHospitalDetails.push({
                            name, address, statusTime: new Date().toLocaleString(), sessions: validSessions.map(s => {
                                const { date,
                                    available_capacity_dose1: dose1_Capacity,
                                } = s;
                                return {
                                    date,
                                    dose1_Capacity,
                                };

                            })
                        });
                    }

                }
            )

        return validHospitalDetails;
    }
    catch (err) {
        console.error('Error while getting state', err)
    }
}

async function getWeeklyCalendar() {
    setDate();
    await initStates();
    const allValidHospitals = await Promise.all(
        districtList.map(p => {
            return getWeeklyCalByIdAndDate(p.district_id, dateToQuery);
        }));
    const cleansedArray = flatten(allValidHospitals.filter(p => p != undefined || P != null));
    if (cleansedArray !== undefined && cleansedArray.length > 0) {
        console.log(JSON.stringify({ hospitals: cleansedArray }));
        writeDataIntoFile(cleansedArray);
    }
}

const interval = setInterval(
    getWeeklyCalendar
    , 0.5 * 60 * 1000);

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Press any key to close?', name => {
    clearInterval(interval);
    console.log(`Closing app!!`);
    readline.close();
});








