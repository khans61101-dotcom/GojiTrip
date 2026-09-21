// Comprehensive Location Hierarchy Data for GojiTrip (Nepal, India, Bhutan, International)

export interface CountryLocationData {
  states: Record<string, string[]>;
}

export const COUNTRIES = [
  "Nepal",
  "India",
  "Bhutan",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "Japan",
  "Other",
];

export const LOCATION_HIERARCHY: Record<string, CountryLocationData> = {
  Nepal: {
    states: {
      "Gandaki Province": [
        "Pokhara",
        "Mustang",
        "Jomsom",
        "Muktinath",
        "Beni",
        "Kusma",
        "Baglung",
        "Damauli",
        "Bandipur",
        "Gorkha",
        "Manang",
        "Syangja",
        "Tatopani",
        "Kagbeni",
      ],
      "Bagmati Province": [
        "Kathmandu",
        "Lalitpur (Patan)",
        "Bhaktapur",
        "Nagarkot",
        "Chitwan",
        "Bharatpur",
        "Sauraha",
        "Dhulikhel",
        "Naubise",
        "Malekhu",
        "Kurintar",
        "Hetauda",
        "Banepa",
        "Panauti",
      ],
      "Lumbini Province": [
        "Lumbini",
        "Butwal",
        "Bhairahawa (Siddharthanagar)",
        "Nepalgunj",
        "Tansen (Palpa)",
        "Dang (Ghorahi / Tulsipur)",
        "Kohalpur",
        "Bardiya",
        "Kapilvastu",
      ],
      "Koshi Province": [
        "Biratnagar",
        "Dharan",
        "Itahari",
        "Birtamod",
        "Ilam",
        "Dhankuta",
        "Damak",
        "Lukla",
        "Namche Bazaar",
        "Solukhumbu",
      ],
      "Madhesh Province": [
        "Janakpur",
        "Birgunj",
        "Simara",
        "Rajbiraj",
        "Lahan",
        "Gaur",
        "Siraha",
        "Jaleshwar",
      ],
      "Sudurpashchim Province": [
        "Dhangadhi",
        "Mahendranagar (Bhimdatta)",
        "Dadeldhura",
        "Tikapur",
        "Dipayal Silgadhi",
        "Baitadi",
      ],
      "Karnali Province": [
        "Birendranagar (Surkhet)",
        "Jumla",
        "Dailekh",
        "Dolpa",
        "Rara (Mugu)",
        "Kalikot",
      ],
    },
  },
  India: {
    states: {
      "Madhya Pradesh": [
        "Bhopal",
        "Indore",
        "Ujjain",
        "Gwalior",
        "Jabalpur",
        "Dewas",
        "Sehore",
        "Ashta",
        "Sonkatch",
        "Shajapur",
        "Sarangpur",
        "Biaora",
        "Guna",
        "Shivpuri",
        "Badarwas",
        "Mohana",
        "Sendhwa",
        "Ratlam",
        "Dhar",
        "Mandav (Mandu)",
        "Mhow",
        "Sagar",
        "Rewa",
        "Satna",
        "Khandwa",
        "Khargone",
        "Burhanpur",
        "Betul",
        "Hoshangabad (Narmadapuram)",
        "Harda",
        "Vidisha",
        "Raisen",
        "Chhindwara",
        "Singrauli",
        "Omkareshwar",
        "Maheshwar",
        "Pachmarhi",
        "Khajuraho",
        "Katni",
        "Damoh",
        "Neemuch",
        "Mandsaur",
      ],
      "Maharashtra": [
        "Mumbai",
        "Pune",
        "Nagpur",
        "Nashik",
        "Aurangabad (Chhatrapati Sambhajinagar)",
        "Thane",
        "Navi Mumbai",
        "Solapur",
        "Kolhapur",
        "Amravati",
        "Nanded",
        "Sangli",
        "Jalgaon",
        "Akola",
        "Latur",
        "Dhule",
        "Ahmednagar",
        "Chandrapur",
        "Parbhani",
        "Malegaon",
        "Sangamner",
        "Narayangaon",
        "Khed",
        "Satara",
        "Ratnagiri",
        "Shirdi",
        "Mahabaleshwar",
        "Lonavala",
        "Alibaug",
      ],
      "Delhi (NCT)": [
        "New Delhi",
        "Central Delhi",
        "South Delhi",
        "North Delhi",
        "East Delhi",
        "West Delhi",
        "Dwarka",
        "Rohini",
        "Connaught Place",
        "Chandni Chowk",
        "Saket",
      ],
      "Punjab": [
        "Chandigarh",
        "Ludhiana",
        "Amritsar",
        "Jalandhar",
        "Patiala",
        "Bathinda",
        "Hoshiarpur",
        "Mohali",
        "Pathankot",
        "Moga",
        "Firozpur",
        "Khanna",
        "Phagwara",
      ],
      "Goa": [
        "Panaji (Panjim)",
        "Margao",
        "Vasco da Gama",
        "Mapusa",
        "Ponda",
        "Calangute",
        "Candolim",
        "Anjuna",
        "Baga",
        "Morjim",
        "Colva",
        "Palolem",
      ],
      "Uttar Pradesh": [
        "Lucknow",
        "Kanpur",
        "Varanasi",
        "Agra",
        "Prayagraj (Allahabad)",
        "Noida",
        "Greater Noida",
        "Ghaziabad",
        "Meerut",
        "Mathura",
        "Vrindavan",
        "Ayodhya",
        "Bareilly",
        "Aligarh",
        "Moradabad",
        "Gorakhpur",
        "Jhansi",
        "Saharanpur",
      ],
      "Rajasthan": [
        "Jaipur",
        "Jodhpur",
        "Udaipur",
        "Kota",
        "Bikaner",
        "Ajmer",
        "Pushkar",
        "Jaisalmer",
        "Alwar",
        "Bharatpur",
        "Mount Abu",
        "Chittorgarh",
        "Sikar",
        "Bhilwara",
      ],
      "Gujarat": [
        "Ahmedabad",
        "Surat",
        "Vadodara",
        "Rajkot",
        "Bhavnagar",
        "Jamnagar",
        "Gandhinagar",
        "Junagadh",
        "Anand",
        "Navsari",
        "Morbi",
        "Vapi",
        "Bhuj",
        "Somnath",
        "Dwarka",
      ],
      "Karnataka": [
        "Bengaluru (Bangalore)",
        "Mysuru (Mysore)",
        "Hubballi-Dharwad",
        "Mangaluru (Mangalore)",
        "Belagavi (Belgaum)",
        "Kalaburagi",
        "Davanagere",
        "Ballari",
        "Vijayapura",
        "Shimoga",
        "Udupi",
        "Hampi",
        "Coorg (Madikeri)",
        "Gokarna",
        "Chikmagalur",
      ],
      "Haryana": [
        "Gurugram (Gurgaon)",
        "Faridabad",
        "Panipat",
        "Ambala",
        "Yamunanagar",
        "Rohtak",
        "Hisar",
        "Karnal",
        "Sonipat",
        "Panchkula",
        "Kurukshetra",
      ],
      "Himachal Pradesh": [
        "Shimla",
        "Manali",
        "Dharamshala",
        "Kullu",
        "Kasauli",
        "Solan",
        "Mandi",
        "Dalhousie",
        "Spiti Valley",
        "Kasol",
        "Chamba",
      ],
      "Uttarakhand": [
        "Dehradun",
        "Haridwar",
        "Rishikesh",
        "Roorkee",
        "Haldwani",
        "Nainital",
        "Mussoorie",
        "Rudrapur",
        "Almora",
        "Chamoli",
        "Kedarnath",
        "Badrinath",
        "Auli",
      ],
      "West Bengal": [
        "Kolkata",
        "Howrah",
        "Durgapur",
        "Asansol",
        "Siliguri",
        "Darjeeling",
        "Kalimpong",
        "Kharagpur",
        "Bardhaman",
        "Malda",
        "Digha",
      ],
      "Bihar": [
        "Patna",
        "Gaya",
        "Bhagalpur",
        "Muzaffarpur",
        "Purnia",
        "Darbhanga",
        "Bihar Sharif",
        "Arrah",
        "Begusarai",
        "Nalanda",
        "Bodh Gaya",
      ],
      "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Tiruchirappalli",
        "Salem",
        "Tirunelveli",
        "Tiruppur",
        "Vellore",
        "Erode",
        "Ooty",
        "Kodaikanal",
        "Kanyakumari",
        "Rameswaram",
      ],
      "Kerala": [
        "Thiruvananthapuram",
        "Kochi (Cochin)",
        "Kozhikode (Calicut)",
        "Kollam",
        "Thrissur",
        "Kannur",
        "Alappuzha (Alleppey)",
        "Palakkad",
        "Munnar",
        "Wayanad",
        "Varkala",
      ],
      "Jammu and Kashmir": [
        "Srinagar",
        "Jammu",
        "Anantnag",
        "Baramulla",
        "Gulmarg",
        "Pahalgam",
        "Sonamarg",
        "Katra (Vaishno Devi)",
        "Udhampur",
      ],
      "Ladakh": [
        "Leh",
        "Kargil",
        "Nubra Valley",
        "Pangong Tso",
      ],
      "Chandigarh": [
        "Chandigarh",
      ],
      "Telangana": [
        "Hyderabad",
        "Warangal",
        "Nizamabad",
        "Karimnagar",
        "Ramagundam",
      ],
      "Andhra Pradesh": [
        "Visakhapatnam",
        "Vijayawada",
        "Guntur",
        "Nellore",
        "Kurnool",
        "Tirupati",
        "Rajahmundry",
      ],
      "Odisha": [
        "Bhubaneswar",
        "Cuttack",
        "Rourkela",
        "Berhampur",
        "Sambalpur",
        "Puri",
        "Konark",
      ],
      "Assam": [
        "Guwahati",
        "Silchar",
        "Dibrugarh",
        "Jorhat",
        "Nagaon",
        "Tezpur",
        "Kaziranga",
      ],
      "Chhattisgarh": [
        "Raipur",
        "Bhilai",
        "Bilaspur",
        "Korba",
        "Durg",
        "Jagdalpur",
      ],
      "Jharkhand": [
        "Ranchi",
        "Jamshedpur",
        "Dhanbad",
        "Bokaro",
        "Deoghar",
        "Hazaribagh",
      ],
    },
  },
  Bhutan: {
    states: {
      "Thimphu": ["Thimphu"],
      "Paro": ["Paro", "Taktsang"],
      "Punakha": ["Punakha"],
      "Bumthang": ["Jakar", "Chamkhar"],
      "Chukha": ["Phuntsholing"],
      "Wangdue Phodrang": ["Wangdue"],
    },
  },
  "United States": {
    states: {
      "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
      "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
      "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
      "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Key West"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver"],
      "Illinois": ["Chicago", "Aurora", "Naperville", "Rockford"],
    },
  },
  "United Kingdom": {
    states: {
      "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol", "Oxford", "Cambridge"],
      "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Inverness"],
      "Wales": ["Cardiff", "Swansea", "Newport"],
      "Northern Ireland": ["Belfast", "Derry"],
    },
  },
  Australia: {
    states: {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat"],
      "Queensland": ["Brisbane", "Gold Coast", "Cairns"],
      "Western Australia": ["Perth", "Fremantle"],
    },
  },
  Canada: {
    states: {
      "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton"],
      "British Columbia": ["Vancouver", "Victoria", "Kelowna"],
      "Quebec": ["Montreal", "Quebec City"],
      "Alberta": ["Calgary", "Edmonton", "Banff"],
    },
  },
  Germany: {
    states: {
      "Bavaria": ["Munich", "Nuremberg", "Augsburg"],
      "Berlin": ["Berlin"],
      "North Rhine-Westphalia": ["Cologne", "Dusseldorf", "Dortmund"],
      "Hesse": ["Frankfurt", "Wiesbaden"],
    },
  },
  Japan: {
    states: {
      "Kanto": ["Tokyo", "Yokohama", "Chiba"],
      "Kansai": ["Osaka", "Kyoto", "Kobe", "Nara"],
      "Hokkaido": ["Sapporo", "Hakodate"],
      "Chubu": ["Nagoya", "Kanazawa", "Takayama"],
    },
  },
};

/**
 * Returns list of states/provinces for a given country.
 */
export function getStatesForCountry(countryName: string): string[] {
  if (!countryName) return [];
  const normalized = countryName.trim();
  const match = Object.keys(LOCATION_HIERARCHY).find(
    (c) => c.toLowerCase() === normalized.toLowerCase()
  );
  if (!match) return [];
  return Object.keys(LOCATION_HIERARCHY[match].states);
}

/**
 * Returns list of cities/districts for a given country and state.
 */
export function getCitiesForState(countryName: string, stateName: string): string[] {
  if (!countryName || !stateName) return [];
  const cNorm = countryName.trim();
  const sNorm = stateName.trim();

  const cMatch = Object.keys(LOCATION_HIERARCHY).find(
    (c) => c.toLowerCase() === cNorm.toLowerCase()
  );
  if (!cMatch) return [];

  const stateDict = LOCATION_HIERARCHY[cMatch].states;
  const sMatch = Object.keys(stateDict).find(
    (s) => s.toLowerCase() === sNorm.toLowerCase() ||
           s.toLowerCase().includes(sNorm.toLowerCase()) ||
           sNorm.toLowerCase().includes(s.toLowerCase())
  );
  if (!sMatch) return [];

  return stateDict[sMatch] || [];
}

/**
 * Finds best matching state name in hierarchy (case-insensitive fuzzy).
 */
export function findMatchingState(countryName: string, stateName: string): string | null {
  if (!countryName || !stateName) return null;
  const states = getStatesForCountry(countryName);
  const clean = stateName.trim().toLowerCase();
  
  // Exact match
  const exact = states.find((s) => s.toLowerCase() === clean);
  if (exact) return exact;

  // Substring match
  const sub = states.find(
    (s) => s.toLowerCase().includes(clean) || clean.includes(s.toLowerCase())
  );
  return sub || null;
}

/**
 * Finds best matching city name in hierarchy (case-insensitive fuzzy).
 */
export function findMatchingCity(countryName: string, stateName: string, cityName: string): string | null {
  if (!countryName || !stateName || !cityName) return null;
  const cities = getCitiesForState(countryName, stateName);
  const clean = cityName.trim().toLowerCase();

  // Exact match
  const exact = cities.find((c) => c.toLowerCase() === clean);
  if (exact) return exact;

  // Substring match
  const sub = cities.find(
    (c) => c.toLowerCase().includes(clean) || clean.includes(c.toLowerCase())
  );
  return sub || null;
}
