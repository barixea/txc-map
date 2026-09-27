/**
 * Hand-drawn positions following the user's 11282023.Web.Campus_Map.jpg.
 * Coordinates follow the reference orientation, not north-up GPS.
 * Simplified footprints are illustrative, not surveyed. Mapbox continues
 * to use the separate geographic coordinates in buildings.ts.
 */
export type MapPoint = readonly [number, number];
export type CampusFootprint = {
  id: string;
  name: string;
  lines: string[];
  points: string;
  center: MapPoint;
  kind?: 'field' | 'court' | 'gym' | 'church';
};
export const CAMPUS_DRAWING = { width: 560, height: 310, top: 110 };
export const CAMPUS_OUTLINE = '16,198 150,173 285,151 359,142 476,143 542,398 450,376 430,354 319,302 258,365 214,346 154,287 137,250 73,295 25,244';
export const CAMPUS_FOOTPRINTS: CampusFootprint[] = [
  { id: 'xu-old-library', name: 'Library Annex', lines: ['LIBRARY', 'ANNEX'], points: '447,183 492,183 496,211 447,211', center: [471,197] },
  { id: 'xu-new-library', name: 'Main Library', lines: ['MAIN LIBRARY'], points: '380,202 438,202 438,224 380,224', center: [409,213] },
  { id: 'museo-de-oro', name: 'Museo de Oro', lines: ['MUSEO', 'DE ORO'], points: '430,148 461,148 466,175 430,175', center: [447,162] },
  { id: 'xavier-hall', name: 'Xavier Hall', lines: ['XAVIER', 'HALL'], points: '388,161 424,161 429,195 388,195', center: [407,179] },
  { id: 'lucas-hall', name: 'Lucas Hall', lines: ['LUCAS HALL'], points: '345,146 386,146 386,161 345,161', center: [365,154] },
  { id: 'campion-hall', name: 'Campion Hall', lines: ['CAMPION', 'HALL'], points: '313,166 375,166 375,195 313,195', center: [344,181] },
  { id: 'university-church', name: 'University Church', lines: ['UNIVERSITY CHURCH'], points: '304,220 363,220 371,227 371,244 304,244', center: [336,232], kind: 'church' },
  { id: 'loyola-house', name: 'Loyola House', lines: ['LOYOLA HOUSE'], points: '245,160 312,160 312,176 245,176', center: [279,168] },
  { id: 'haggerty-house', name: 'Haggerty House', lines: ['HAGGERTY'], points: '206,165 237,165 237,178 206,178', center: [222,172] },
  { id: 'soccer-field', name: 'Soccer Field', lines: [], points: '174,186 282,183 282,252 160,252', center: [224,218], kind: 'field' },
  { id: 'amphitheater', name: 'Amphitheater', lines: ['AMPHI-','THEATER'], points: '129,174 151,174 151,198 129,198', center: [140,187] },
  { id: 'faber-hall', name: 'Faber Hall', lines: ['FABER'], points: '93,181 127,181 127,199 93,199', center: [110,190] },
  { id: 'medicine-building', name: 'Medicine Building', lines: ['MEDICINE'], points: '23,199 58,199 58,234 23,234', center: [41,216] },
  { id: 'engineering-building', name: 'Engineering Building', lines: ['ENGINEERING'], points: '62,219 142,219 142,244 62,244', center: [102,232] },
  { id: 'religious-of-the-assumption', name: 'Religious of the Assumption', lines: ['R. OF THE', 'ASSUMPTION'], points: '47,249 64,244 73,262 55,272', center: [60,257] },
  { id: 'engineering-annex', name: 'Engineering Annex', lines: ['ENG. ANNEX'], points: '78,248 106,250 93,279 71,276', center: [87,264] },
  { id: 'physical-plant-workshop', name: 'Physical Plant Workshop', lines: ['WORKSHOP'], points: '146,282 157,279 175,302 165,311', center: [160,295] },
  { id: 'physical-plant-offices', name: 'Physical Plant Office', lines: ['PLANT', 'OFFICE'], points: '169,310 178,305 194,325 185,334', center: [180,320] },
  { id: 'sbm-building', name: 'SBM Building', lines: ['SBM BUILDING'], points: '164,258 251,258 251,277 158,277', center: [207,268] },
  { id: 'covered-court', name: 'Covered Court', lines: [], points: '207,314 235,286 278,320 248,353', center: [241,319], kind: 'court' },
  { id: 'social-science-building', name: 'Social Science Building', lines: ['SOCIAL', 'SCIENCE'], points: '263,257 292,257 292,286 263,286', center: [278,272] },
  { id: 'little-theater', name: 'Little Theater', lines: ['LITTLE', 'THEATER'], points: '296,256 324,256 324,285 296,285', center: [310,271] },
  { id: 'student-center', name: 'STC Building', lines: ['STC BUILDING'], points: '335,286 389,286 395,311 335,311', center: [363,299] },
  { id: 'magis-building', name: 'Magis Building (Canteen)', lines: ['MAGIS'], points: '354,264 382,264 384,281 354,281', center: [369,273] },
  { id: 'sped-lab', name: 'SPED Lab', lines: ['SPED'], points: '414,336 435,336 438,352 416,352', center: [426,344] },
  { id: 'xu-gym', name: 'University Gym', lines: [], points: '441,311 510,311 529,369 446,369 432,354', center: [481,342], kind: 'gym' },
  { id: 'agriculture-building', name: 'Agriculture Building', lines: ['AGRICULTURE'], points: '413,282 497,282 502,304 413,304', center: [457,293] },
  { id: 'science-center', name: 'Science Center Building', lines: ['SCIENCE CENTER'], points: '398,250 478,250 482,271 398,271', center: [440,261] },
  { id: 'sec-mall', name: 'SEP Mall', lines: ['SEP'], points: '483,251 497,251 502,273 483,273', center: [491,263] },
];

/** Add an anchor when enabling another event venue on the illustrated map. */
export const CAMPUS_ANCHORS: Record<string, MapPoint> = {
  ...Object.fromEntries(CAMPUS_FOOTPRINTS.map((building) => [building.id, building.center])),
  'main-gate-corrales': [491,231], 'mortola-gate': [74,290],
  'finance-office': [400,183], 'registrar-office': [410,185],
  'scholarships-financial-aid': [417,179], 'peace-park': [339,266],
};
