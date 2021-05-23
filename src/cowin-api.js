"use-strict";
const axios = require('axios');
const { filter } = require("lodash");
const { VaccineAvailabilityThreshHold, DistrictNamesMap } = require("./constants");


const getWeeklyCalByIdAndDate = async (id, date, ageFilter) => {
    try {
        const respose = await axios.get(
            `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${id}&date=${date}`,
            {
                headers: {
                    accept: "application/json",
                    "User-Agent": "IOS",
                },
            }
        );

        const validHospitalDetails = [];
        respose.data.centers.forEach((p) => {
            const validSessions = filter(p.sessions, (ses) => {
                return ageFilter !== undefined
                    ? ses.available_capacity_dose1 > VaccineAvailabilityThreshHold &&
                    ses.min_age_limit === ageFilter
                    : ses.available_capacity_dose1 > VaccineAvailabilityThreshHold;
            });

            if (
                validSessions !== null &&
                validSessions !== undefined &&
                validSessions.length > 0
            ) {
                const { name, address, fee_type, vaccine_fees } = p;
                const fee =
                    fee_type === "Paid"
                        ? vaccine_fees !== undefined &&
                            vaccine_fees.length > 0 &&
                            (vaccine_fees[0].fee !== undefined || vaccine_fees[0].fee !== "")
                            ? vaccine_fees[0].fee
                            : "Paid"
                        : "Free";

                validHospitalDetails.push({
                    statusTime: new Date().toLocaleString(),
                    district: DistrictNamesMap.get(id) || "",
                    name,
                    address,
                    fee,
                    sessions: validSessions.map((s) => {
                        const {
                            date,
                            available_capacity_dose1: availableSlots,
                            vaccine,
                            min_age_limit: ageGroup,
                        } = s;
                        return ageFilter !== undefined
                            ? {
                                date,
                                availableSlots,
                                vaccine,
                            }
                            : {
                                date,
                                availableSlots,
                                vaccine,
                                ageGroup,
                            };
                    }),
                });
            }
        });

        return validHospitalDetails;
    } catch (err) {
        console.error(`Error while getting Weekly Calendar By Id Status: ${err.response?.status}`,
            err.response.data
        );

    }
    return [];
};

const getDistricts = async (id) => {    
    try {
        const respose = await axios.get(
            `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${id}`,
            {
                headers: {
                    accept: "application/json",
                    "User-Agent": "IOS",
                },
            }
        );

        return respose.data.districts;
    } catch (err) {
        console.error(
            `Error while getting District List of a state ${id} Status: ${err.response?.status}`,
            err.response.data
        );
    }
};

module.exports = {
    getDistricts,
    getWeeklyCalByIdAndDate,
};
