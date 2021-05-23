const NewlineChar = "\n";
const VaccineAvailabilityThreshHold = 5;
const PuneDistrictId = 363;
const DelhiStateId = 9;

const NcrAdditionalDistricts = [
    {
        district_id: 199,
        district_name: "Faridabad"
    },
    {
        district_id: 188,
        district_name: "Gurgaon"
    },

    {
        district_id: 650,
        district_name: "Gautam Buddha Nagar"
    },
    {
        district_id: 651,
        district_name: "Ghaziabad"
    },
    {
        district_id: 652,
        district_name: "Ghazipur"
    }
];
const DistrictNamesMap = new Map();


module.exports = {
    NewlineChar, 
    VaccineAvailabilityThreshHold,
    PuneDistrictId,
    DelhiStateId,
    NcrAdditionalDistricts,
    DistrictNamesMap
};