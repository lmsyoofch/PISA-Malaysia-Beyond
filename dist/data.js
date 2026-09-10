// PISA 2025 snapshot. Null means not verified in this curated dataset.
export const subjects = {math:'Mathematics',reading:'Reading',science:'Science',digital:'Computational problem-solving'};
export const oecd={math:463,reading:461,science:482,digital:500};
const gps=code=>`https://gpseducation.oecd.org/CountryProfile?primaryCountry=${code}&topic=PI&treshold=5`;
export const countries=[
{code:'MYS',name:'Malaysia',lat:4.2,lng:102.1,region:'sea',math:397,reading:393,science:419,digital:484,lowScience:46.4,changes:{math:-11,reading:5,science:3},ns:['reading','science'],note:'Mathematics declined. The small reading and science increases were not statistically significant. All three subjects remain below 2018.',source:gps('MYS')},
{code:'SGP',name:'Singapore',lat:1.35,lng:103.82,region:'sea',math:563,reading:535,science:560,digital:563,lowScience:9.9,changes:{math:-12,reading:-8,science:-2},ns:['science'],note:'High scores across the core subjects. Science was statistically stable between 2022 and 2025.',source:gps('SGP')},
{code:'VNM',name:'Vietnam',lat:16,lng:107.6,region:'sea',math:443,reading:392,science:457,digital:461,lowScience:28.7,changes:{},ns:[],note:'Moved from paper to computer assessment in 2025. OECD excludes Vietnam from performance-trend analysis because comparability is uncertain.',source:gps('VNM')},
{code:'BRN',name:'Brunei',lat:4.54,lng:114.73,region:'sea',math:435,reading:426,science:439,digital:496,lowScience:38.9,changes:{math:-7,reading:-4,science:-6},ns:['reading','science'],note:'Core subject scores exceed Malaysia’s. Reading and science changes were not statistically significant.',source:gps('BRN')},
{code:'THA',name:'Thailand',lat:16,lng:100.3,region:'sea',math:407,reading:392,science:432,digital:476,lowScience:41,changes:{math:13,reading:13,science:23},ns:[],note:'Improved across all three core subjects between 2022 and 2025.',source:gps('THA')},
{code:'IDN',name:'Indonesia',lat:-3,lng:117,region:'sea',math:364,reading:365,science:389,digital:427,lowScience:63.2,changes:{math:-2,reading:7,science:6},ns:['math','reading','science'],note:'All three reported changes were not statistically significant.',source:gps('IDN')},
{code:'PHL',name:'Philippines',lat:12.9,lng:122,region:'sea',math:371,reading:367,science:373,digital:null,lowScience:68.4,changes:{math:16,reading:20,science:17},ns:[],note:'Improved in all three core subjects from a low starting point. Digital score not verified for this map.',source:gps('PHL')},
{code:'KHM',name:'Cambodia',lat:12.56,lng:104.99,region:'sea',math:null,reading:null,science:null,digital:null,lowScience:67,changes:{},ns:[],note:'Mean scores were not reliably retrieved for this map. The OECD reports 33% at or above baseline in science, implying approximately 67% below it. Missing scores do not mean zero.',source:'https://www.oecd.org/en/publications/pisa-2025-results-volume-i-country-notes_2d4ff9ea-en/cambodia_cbcda07e-en.html'},
{code:'LAO',name:'Laos',lat:19.8,lng:102.6,region:'sea',math:null,reading:null,science:null,digital:null,changes:{},ns:[],note:'Comparable 2025 results have not been verified for this curated map. This is not a claim about participation.',source:null},
{code:'MMR',name:'Myanmar',lat:21.9,lng:95.9,region:'sea',math:null,reading:null,science:null,digital:null,changes:{},ns:[],note:'Comparable 2025 results have not been verified for this curated map. This is not a claim about participation.',source:null},
{code:'TLS',name:'Timor-Leste',lat:-8.87,lng:125.73,region:'sea',math:null,reading:null,science:null,digital:null,changes:{},ns:[],note:'Comparable 2025 results have not been verified for this curated map. This is not a claim about participation.',source:null},
{code:'JPN',name:'Japan',lat:36.2,lng:138.25,region:'global',math:525,reading:503,science:538,digital:557,lowScience:11.3,changes:{math:-10,reading:-13,science:-9},ns:['math','science'],note:'An additional international benchmark. Mathematics and science changes were not statistically significant.',source:gps('JPN')},
{code:'EST',name:'Estonia',lat:58.6,lng:25,region:'global',math:null,reading:null,science:527,digital:null,lowScience:9.9,changes:{science:1},ns:['science'],note:'An additional European science benchmark. Other subject scores have not been verified for this map.',source:gps('EST')}
];
export const malaysia=countries[0];
export const value=(c,subject,mode)=>typeof c[subject]!=='number'?null:mode==='gap'?c[subject]-malaysia[subject]:c[subject];
export const format=n=>n==null?'Not verified':String(n);
export const signed=n=>n>0?`+${n}`:String(n);
export function colour(n,mode){if(n==null)return '#8b97a8';if(mode==='gap')return n<0?'#cf7b32':n===0?'#315ad8':'#008772';return n<400?'#d9904a':n<450?'#73aab6':n<500?'#218d9e':n<550?'#126677':'#17364c'}
