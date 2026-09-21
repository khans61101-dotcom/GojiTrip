import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    L: any;
  }
}

export interface MapMarkerItem {
  id: string | number;
  name: string;
  location?: string;
  priceTag?: string;
  rating?: number;
  image?: string;
  lat?: number;
  lng?: number;
  category?: "hotel" | "restaurant" | "transport" | "place";
}

interface InteractiveMapProps {
  items: MapMarkerItem[];
  selectedId?: string | number | null;
  onMarkerClick: (id: string) => void;
  center?: { lat: number; lng: number };
  drawPolyline?: boolean;
}

// Extensive dictionary for cities, states, and countries
const LOCATION_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  // Punjab & North India
  "punjab": { lat: 30.9009, lng: 75.8573 },
  "panjab": { lat: 30.9009, lng: 75.8573 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "ludhiana": { lat: 30.9009, lng: 75.8573 },
  "amritsar": { lat: 31.6340, lng: 74.8723 },
  "jalandhar": { lat: 31.3260, lng: 75.5762 },
  "patiala": { lat: 30.3398, lng: 76.3869 },
  "pathankot": { lat: 32.2686, lng: 75.6496 },
  "bathinda": { lat: 30.2110, lng: 74.9455 },
  "haryana": { lat: 29.0588, lng: 76.0856 },
  "gurgaon": { lat: 28.4595, lng: 77.0266 },
  "gurugram": { lat: 28.4595, lng: 77.0266 },

  // Goa & South/West India
  "goa": { lat: 15.2993, lng: 74.1240 },
  "panaji": { lat: 15.4909, lng: 73.8278 },
  "panjim": { lat: 15.4909, lng: 73.8278 },
  "margao": { lat: 15.2832, lng: 73.9862 },
  "vasco": { lat: 15.3960, lng: 73.8157 },
  "maharashtra": { lat: 19.7515, lng: 75.7139 },
  "dhule": { lat: 20.9042, lng: 74.7749 },
  "jalgaon": { lat: 21.0077, lng: 75.5626 },
  "malegaon": { lat: 20.5579, lng: 74.5089 },
  "solapur": { lat: 17.6599, lng: 75.9064 },
  "amravati": { lat: 20.9374, lng: 77.7796 },
  "nanded": { lat: 19.1383, lng: 77.3210 },
  "sangli": { lat: 16.8524, lng: 74.5815 },
  "akola": { lat: 20.7002, lng: 77.0082 },
  "latur": { lat: 18.4088, lng: 76.5604 },
  "aurangabad": { lat: 19.8762, lng: 75.3433 },
  "chhatrapati sambhajinagar": { lat: 19.8762, lng: 75.3433 },
  "ahmednagar": { lat: 19.0948, lng: 74.7480 },
  "satara": { lat: 17.6805, lng: 74.0183 },
  "ratnagiri": { lat: 16.9902, lng: 73.3120 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "kolhapur": { lat: 16.7050, lng: 74.2433 },
  "karnataka": { lat: 15.3173, lng: 75.7139 },
  "hubli": { lat: 15.3647, lng: 75.1240 },
  "belgaum": { lat: 15.8497, lng: 74.4977 },

  // Central & Other India Cities & Regions
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "berasia": { lat: 23.6333, lng: 77.4333 },
  "berasiya": { lat: 23.6333, lng: 77.4333 },
  "madhya pradesh": { lat: 23.2599, lng: 77.4126 },
  "m.p": { lat: 23.2599, lng: 77.4126 },
  "m. p": { lat: 23.2599, lng: 77.4126 },
  "gwalior": { lat: 26.2183, lng: 78.1784 },
  "jabalpur": { lat: 23.1815, lng: 79.9864 },
  "sagar": { lat: 23.8388, lng: 78.7378 },
  "rewa": { lat: 24.5362, lng: 81.3037 },
  "satna": { lat: 24.6005, lng: 80.8322 },
  "sehore": { lat: 23.2030, lng: 77.0844 },
  "ashta": { lat: 23.0189, lng: 76.5502 },
  "sonkatch": { lat: 22.9772, lng: 76.3688 },
  "dewas": { lat: 22.9676, lng: 76.0534 },
  "indore": { lat: 22.7196, lng: 75.8577 },
  "ujjain": { lat: 23.1765, lng: 75.7885 },
  "ratlam": { lat: 23.3315, lng: 75.0367 },
  "omkareshwar": { lat: 22.2464, lng: 76.1517 },
  "maheshwar": { lat: 22.1770, lng: 75.5843 },
  "dhar": { lat: 22.5976, lng: 75.3023 },
  "mandav": { lat: 22.4357, lng: 75.3411 },
  "mhow": { lat: 22.5526, lng: 75.7554 },
  "singrauli": { lat: 24.1993, lng: 82.6739 },
  "khandwa": { lat: 21.8314, lng: 76.3498 },
  "khargone": { lat: 21.8245, lng: 75.6105 },
  "burhanpur": { lat: 21.3145, lng: 76.2253 },
  "betul": { lat: 21.9048, lng: 77.8980 },
  "hoshangabad": { lat: 22.7519, lng: 77.7289 },
  "narmadapuram": { lat: 22.7519, lng: 77.7289 },
  "harda": { lat: 22.3395, lng: 77.0914 },
  "vidisha": { lat: 23.5251, lng: 77.8081 },
  "raisen": { lat: 23.3323, lng: 77.7944 },
  "chhindwara": { lat: 22.0574, lng: 78.9382 },

  // Nepal Highway Corridor Locations
  "naubise": { lat: 27.7144, lng: 85.1764 },
  "malekhu": { lat: 27.8105, lng: 84.8290 },
  "mugling": { lat: 27.8596, lng: 84.5574 },
  "kurintar": { lat: 27.8683, lng: 84.5800 },
  "dumre": { lat: 27.9734, lng: 84.4258 },
  "bandipur": { lat: 27.9372, lng: 84.4172 },
  "damauli": { lat: 27.9701, lng: 84.2828 },
  "bharatpur": { lat: 27.6833, lng: 84.4333 },
  "kusma": { lat: 28.2255, lng: 83.6789 },
  "beni": { lat: 28.3449, lng: 83.5647 },
  "tatopani": { lat: 28.4900, lng: 83.6550 },
  "jomsom": { lat: 28.7818, lng: 83.7431 },
  "kagbeni": { lat: 28.8378, lng: 83.7828 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "shimla": { lat: 31.1048, lng: 77.1734 },
  "manali": { lat: 32.2432, lng: 77.1892 },
  "dharamsala": { lat: 32.2190, lng: 76.3234 },
  "rishikesh": { lat: 30.0869, lng: 78.2676 },
  "dehradun": { lat: 30.3165, lng: 78.0322 },
  "india": { lat: 20.5937, lng: 78.9629 },

  // Nepal Cities & Regions
  "kathmandu": { lat: 27.7172, lng: 85.3240 },
  "pokhara": { lat: 28.2096, lng: 83.9856 },
  "lakeside": { lat: 28.2096, lng: 83.9580 },
  "chitwan": { lat: 27.5291, lng: 84.3542 },
  "sauraha": { lat: 27.5756, lng: 84.4947 },
  "lumbini": { lat: 27.4776, lng: 83.2755 },
  "mustang": { lat: 28.9986, lng: 83.8473 },
  "jomson": { lat: 28.7816, lng: 83.7292 },
  "muktinath": { lat: 28.8170, lng: 83.8717 },
  "everest": { lat: 27.9881, lng: 86.9250 },
  "lukla": { lat: 27.6869, lng: 86.7294 },
  "namche": { lat: 27.8069, lng: 86.7142 },
  "annapurna": { lat: 28.5300, lng: 83.8700 },
  "nagarkot": { lat: 27.7172, lng: 85.5200 },
  "bhaktapur": { lat: 27.6710, lng: 85.4298 },
  "patan": { lat: 27.6644, lng: 85.3188 },
  "lalitpur": { lat: 27.6644, lng: 85.3188 },
  "dharan": { lat: 26.8124, lng: 87.2834 },
  "biratnagar": { lat: 26.4525, lng: 87.2718 },
  "birgunj": { lat: 27.0099, lng: 84.8777 },
  "janakpur": { lat: 26.7288, lng: 85.9248 },
  "butwal": { lat: 27.7006, lng: 83.4484 },
  "bhairahawa": { lat: 27.5050, lng: 83.4533 },
  "nepalgunj": { lat: 28.0500, lng: 81.6167 },
  "dhangadhi": { lat: 28.6833, lng: 80.6000 },
  "gorkha": { lat: 28.0000, lng: 84.6333 },
  "nepal": { lat: 28.3949, lng: 84.1240 },

  // Additional Highway Cities & Waypoints across Major Corridors
  "shivpuri": { lat: 25.4358, lng: 77.6480 },
  "guna": { lat: 24.6468, lng: 77.3086 },
  "biaora": { lat: 23.9164, lng: 76.9180 },
  "sarangpur": { lat: 23.5698, lng: 76.4682 },
  "shajapur": { lat: 23.4266, lng: 76.2778 },
  "badarwas": { lat: 24.9680, lng: 77.5684 },
  "mohana": { lat: 25.9200, lng: 77.9400 },
  "morena": { lat: 26.4997, lng: 77.9944 },
  "dholpur": { lat: 26.6997, lng: 77.8932 },
  "bina": { lat: 24.1706, lng: 78.1837 },
  "sanchi": { lat: 23.4833, lng: 77.7333 },
  "ashoknagar": { lat: 24.5770, lng: 77.7280 },
  "datia": { lat: 25.6698, lng: 78.4612 },
  "jhansi": { lat: 25.4484, lng: 78.5685 },
  "shirpur": { lat: 21.3508, lng: 74.8797 },
  "sendhwa": { lat: 21.6820, lng: 75.0970 },
  "chandwad": { lat: 20.3289, lng: 74.2419 },
  "sangamner": { lat: 19.5760, lng: 74.2070 },
  "narayangaon": { lat: 19.1172, lng: 73.9744 },
  "khed": { lat: 18.8550, lng: 73.9160 },
  "rajgurunagar": { lat: 18.8550, lng: 73.9160 },
  "igatpuri": { lat: 19.6953, lng: 73.5594 },
  "shahapur": { lat: 19.4533, lng: 73.3294 },
  "thane": { lat: 19.2183, lng: 72.9781 },
  "bhiwandi": { lat: 19.2968, lng: 73.0631 },
  "vadodara": { lat: 22.3072, lng: 73.1812 },
  "bharuch": { lat: 21.7051, lng: 72.9959 },
  "ankleshwar": { lat: 21.6264, lng: 73.0033 },
  "navsari": { lat: 20.9467, lng: 72.9520 },
  "vapi": { lat: 20.3893, lng: 72.9106 },
  "dahod": { lat: 22.8373, lng: 74.2562 },
  "jhabua": { lat: 22.7691, lng: 74.5935 },
  "godhra": { lat: 22.7778, lng: 73.6144 },
  "nadiad": { lat: 22.6916, lng: 72.8634 },
  "anand": { lat: 22.5645, lng: 72.9289 },
  "kota": { lat: 25.2138, lng: 75.8648 },
  "jhalawar": { lat: 24.5972, lng: 76.1610 },
  "chittorgarh": { lat: 24.8887, lng: 74.6269 },
  "udaipur": { lat: 24.5854, lng: 73.7125 },
  "bhilwara": { lat: 25.3463, lng: 74.6364 },
  "ajmer": { lat: 26.4499, lng: 74.6399 },
  "shahpura": { lat: 27.3876, lng: 75.9625 },
  "kotputli": { lat: 27.7029, lng: 76.2008 },
  "neemrana": { lat: 27.9880, lng: 76.3820 },
  "dharuhera": { lat: 28.2078, lng: 76.7827 },

  // North India Corridor Cities (for Indore→Punjab, Indore→Delhi, etc.)
  "palwal": { lat: 28.1440, lng: 77.3336 },
  "faridabad": { lat: 28.4089, lng: 77.3178 },
  "panipat": { lat: 29.3909, lng: 76.9635 },
  "karnal": { lat: 29.6857, lng: 76.9905 },
  "kurukshetra": { lat: 29.9695, lng: 76.8783 },
  "ambala": { lat: 30.3752, lng: 76.7821 },
  "rajpura": { lat: 30.4836, lng: 76.5948 },
  "sirhind": { lat: 30.6312, lng: 76.3849 },
  "ropar": { lat: 30.9643, lng: 76.5281 },

  // Rajasthan Highways — used by Indore→Jaipur, Indore→Delhi routes
  "bundi": { lat: 25.4392, lng: 75.6490 },
  "tonk": { lat: 26.1685, lng: 75.7900 },
  "sawai madhopur": { lat: 26.0172, lng: 76.3544 },
  "bharatpur raj": { lat: 27.2152, lng: 77.4938 },
  "alwar": { lat: 27.5666, lng: 76.6346 },
  "tijara": { lat: 27.9381, lng: 76.8241 },

  // Bihar / Eastern Corridor
  "gaya": { lat: 24.7955, lng: 85.0002 },
  "sasaram": { lat: 24.9503, lng: 84.0318 },
  "aurangabad bih": { lat: 24.7530, lng: 84.3714 },
  "mughal sarai": { lat: 25.2822, lng: 83.1203 },
  "allahabad": { lat: 25.4358, lng: 81.8463 },
  "prayagraj": { lat: 25.4358, lng: 81.8463 },
  "mirzapur": { lat: 25.1462, lng: 82.5695 },
  "gorakhpur": { lat: 26.7605, lng: 83.3732 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "bareilly": { lat: 28.3670, lng: 79.4304 },
  "moradabad": { lat: 28.8386, lng: 78.7733 },
  "meerut": { lat: 28.9845, lng: 77.7064 },
  "ghaziabad": { lat: 28.6692, lng: 77.4538 },
  "noida": { lat: 28.5355, lng: 77.3910 },

  // Gujarat Full Corridor
  "mehsana": { lat: 23.5879, lng: 72.3693 },
  "palanpur": { lat: 24.1726, lng: 72.4376 },
  "himmatnagar": { lat: 23.5993, lng: 72.9584 },

  // MP Interior (for general MP corridor fallback)
  "rajgarh": { lat: 23.7577, lng: 76.7257 },
  "narsinghpur": { lat: 22.9455, lng: 79.1944 },
  "sihora": { lat: 23.4839, lng: 80.1067 },
  "pipariya": { lat: 22.7651, lng: 78.3503 },
  "itarsi": { lat: 22.6157, lng: 77.7647 },
  "obaidullaganj": { lat: 23.0133, lng: 77.4906 },

  // Uttarakhand Corridor
  "haridwar": { lat: 29.9457, lng: 78.1642 },
  "roorkee": { lat: 29.8543, lng: 77.8880 },
  "muzaffarnagar": { lat: 29.4727, lng: 77.7085 },
  "saharanpur": { lat: 29.9640, lng: 77.5461 },

  // South India & North-South Corridor (e.g. Bhopal ➔ Rameswaram, Delhi ➔ Kanyakumari)
  "rameshwaram": { lat: 9.2876, lng: 79.3129 },
  "rameshawaram": { lat: 9.2876, lng: 79.3129 },
  "rameswaram": { lat: 9.2876, lng: 79.3129 },
  "rameswar": { lat: 9.2876, lng: 79.3129 },
  "rameshwar": { lat: 9.2876, lng: 79.3129 },
  "kanyakumari": { lat: 8.0883, lng: 77.5385 },
  "madurai": { lat: 9.9252, lng: 78.1198 },
  "tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
  "trichy": { lat: 10.7905, lng: 78.7047 },
  "dindigul": { lat: 10.3673, lng: 77.9803 },
  "karur": { lat: 10.9601, lng: 78.0766 },
  "salem": { lat: 11.6643, lng: 78.1460 },
  "dharmapuri": { lat: 12.1211, lng: 78.1582 },
  "hosur": { lat: 12.7409, lng: 77.8253 },
  "krishnagiri": { lat: 12.5266, lng: 78.2146 },
  "anantapur": { lat: 14.6819, lng: 77.6006 },
  "kurnool": { lat: 15.8281, lng: 78.0373 },
  "mahabubnagar": { lat: 16.7488, lng: 77.9863 },
  "secunderabad": { lat: 17.4399, lng: 78.4983 },
  "kamareddy": { lat: 18.3228, lng: 78.3411 },
  "nizamabad": { lat: 18.6725, lng: 78.0941 },
  "adilabad": { lat: 19.6641, lng: 78.5320 },
  "hinganghat": { lat: 20.5539, lng: 78.8358 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "cochin": { lat: 9.9312, lng: 76.2673 },
  "alappuzha": { lat: 9.4981, lng: 76.3388 },
  "vellore": { lat: 12.9165, lng: 79.1325 },
  "vijayawada": { lat: 16.5062, lng: 80.6480 },
  "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "guntur": { lat: 16.3067, lng: 80.4365 },
  "nellore": { lat: 14.4426, lng: 79.9865 },
  "tirupati": { lat: 13.6288, lng: 79.4192 },

  // Odisha (Bhubaneswar, Cuttack, Puri, Rourkela, etc.)
  "odisha": { lat: 20.9517, lng: 85.0985 },
  "orissa": { lat: 20.9517, lng: 85.0985 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "cuttack": { lat: 20.4625, lng: 85.8828 },
  "puri": { lat: 19.8135, lng: 85.8312 },
  "rourkela": { lat: 22.2604, lng: 84.8536 },
  "berhampur": { lat: 19.3150, lng: 84.7941 },
  "sambalpur": { lat: 21.4669, lng: 83.9812 },
  "konark": { lat: 19.8876, lng: 86.0945 },
  "balasore": { lat: 21.4934, lng: 86.9135 },
  "baripada": { lat: 21.9346, lng: 86.7324 },

  // Chhattisgarh (connecting central India to Odisha: Bhopal ➔ Raipur ➔ Odisha)
  "chhattisgarh": { lat: 21.2787, lng: 81.8661 },
  "raipur": { lat: 21.2514, lng: 81.6296 },
  "bhilai": { lat: 21.2144, lng: 81.4284 },
  "durg": { lat: 21.1904, lng: 81.2849 },
  "bilaspur": { lat: 22.0797, lng: 82.1409 },
  "korba": { lat: 22.3595, lng: 82.7501 },
  "raigarh": { lat: 21.8974, lng: 83.3950 },
  "jagdalpur": { lat: 19.0740, lng: 82.0084 },
  "rajnandgaon": { lat: 21.0974, lng: 81.0345 },

  // Jharkhand & Bihar
  "jharkhand": { lat: 23.6102, lng: 85.2799 },
  "ranchi": { lat: 23.3441, lng: 85.3096 },
  "jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "dhanbad": { lat: 23.7957, lng: 86.4304 },
  "bokaro": { lat: 23.6693, lng: 86.1511 },
  "deoghar": { lat: 24.4826, lng: 86.6997 },
  "hazaribagh": { lat: 23.9925, lng: 85.3637 },

  // West Bengal
  "west bengal": { lat: 22.9868, lng: 87.8550 },
  "howrah": { lat: 22.5958, lng: 88.2636 },
  "durgapur": { lat: 23.5204, lng: 87.3119 },
  "asansol": { lat: 23.6739, lng: 86.9524 },
  "siliguri": { lat: 26.7271, lng: 88.3953 },
  "darjeeling": { lat: 27.0410, lng: 88.2663 },
  "kalimpong": { lat: 27.0594, lng: 88.4695 },
  "kharagpur": { lat: 22.3460, lng: 87.2320 },

  // Assam & Northeast
  "assam": { lat: 26.2006, lng: 92.9376 },
  "guwahati": { lat: 26.1445, lng: 91.7362 },
  "silchar": { lat: 24.8333, lng: 92.7789 },
  "dibrugarh": { lat: 27.4728, lng: 94.9120 },
  "jorhat": { lat: 26.7509, lng: 94.2037 },
  "nagaon": { lat: 26.3468, lng: 92.6840 },
  "tezpur": { lat: 26.6528, lng: 92.7926 },
  "kaziranga": { lat: 26.5775, lng: 93.1711 },
  "shillong": { lat: 25.5788, lng: 91.8933 },
  "gangtok": { lat: 27.3389, lng: 88.6065 },
  "sikkim": { lat: 27.5330, lng: 88.5122 },

  // Jammu, Kashmir & Ladakh
  "srinagar": { lat: 34.0837, lng: 74.7973 },
  "jammu": { lat: 32.7266, lng: 74.8570 },
  "katra": { lat: 32.9926, lng: 74.9317 },
  "vaishnodevi": { lat: 33.0308, lng: 74.9490 },
  "leh": { lat: 34.1526, lng: 77.5771 },
  "ladakh": { lat: 34.1526, lng: 77.5771 },
  "kargil": { lat: 34.5539, lng: 76.1349 },
};

export { LOCATION_COORDINATES_MAP };

export function lookupSingleCoordinate(str: string): { lat: number; lng: number } | null {
  const strLower = str.toLowerCase().trim();
  if (!strLower) return null;

  // 1. Search specific city/region keys (sorted by length descending, ignoring generic country names)
  const cityKeysSorted = Object.keys(LOCATION_COORDINATES_MAP)
    .filter((k) => k !== "india" && k !== "nepal")
    .sort((a, b) => b.length - a.length);

  for (const key of cityKeysSorted) {
    if (strLower.includes(key)) {
      return LOCATION_COORDINATES_MAP[key];
    }
  }

  // 2. Fuzzy normalized check (strips punctuation and handles vowel variations like rameshawaram -> rameshwaram)
  const normStr = strLower.replace(/[^a-z0-9]/g, "");
  for (const key of cityKeysSorted) {
    const normKey = key.replace(/[^a-z0-9]/g, "");
    if (
      normStr.includes(normKey) ||
      normKey.includes(normStr) ||
      normStr.replace(/h/g, "").replace(/a/g, "") === normKey.replace(/h/g, "").replace(/a/g, "")
    ) {
      return LOCATION_COORDINATES_MAP[key];
    }
  }

  // 3. Fallback to generic country centers if no specific city matches
  if (strLower.includes("india")) return LOCATION_COORDINATES_MAP["india"];
  if (strLower.includes("nepal")) return LOCATION_COORDINATES_MAP["nepal"];

  return null;
}

export function resolveItemDirectCoordinate(item: MapMarkerItem): { lat: number; lng: number } | null {
  const rawText = `${item.location || ""} ${item.name || ""}`.trim();
  const textLower = rawText.toLowerCase();

  // 1. Single location lookup
  const singleMatch = lookupSingleCoordinate(rawText);
  if (singleMatch) {
    const hash = textLower.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLat = ((hash % 100) / 10000) - 0.005;
    const jitterLng = (((hash >> 2) % 100) / 10000) - 0.005;
    return { lat: singleMatch.lat + jitterLat, lng: singleMatch.lng + jitterLng };
  }

  // 2. Compound split
  const splitDelimiters = [" - ", " – ", " — ", " to ", " ➔ ", " -> "];
  for (const delim of splitDelimiters) {
    if (textLower.includes(delim)) {
      const parts = textLower.split(delim);
      if (parts.length >= 2) {
        const c1 = lookupSingleCoordinate(parts[0]);
        const c2 = lookupSingleCoordinate(parts[1]);
        if (c1 && c2) {
          return {
            lat: (c1.lat + c2.lat) / 2,
            lng: (c1.lng + c2.lng) / 2,
          };
        }
        if (c1) return c1;
        if (c2) return c2;
      }
    }
  }

  // 3. Explicit numeric lat/lng
  const numLat = Number(item.lat);
  const numLng = Number(item.lng);
  if (!isNaN(numLat) && numLat !== 0 && !isNaN(numLng) && numLng !== 0) {
    return { lat: numLat, lng: numLng };
  }

  return null;
}

export function resolveAllItemCoordinates(items: MapMarkerItem[]): Array<{ lat: number; lng: number }> {
  if (items.length === 0) return [];

  // Source and destination items
  const sourceItem = items[0];
  const destItem = items[items.length - 1];

  const sourceCoords = sourceItem ? lookupSingleCoordinate(`${sourceItem.location || ""} ${sourceItem.name || ""}`) : null;
  const destCoords = destItem ? lookupSingleCoordinate(`${destItem.location || ""} ${destItem.name || ""}`) : null;

  // Pass 1: Try direct resolution for each item
  const resolved: Array<{ lat: number; lng: number } | null> = items.map((item, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === items.length - 1;

    // Explicit numeric lat/lng
    const numLat = Number(item.lat);
    const numLng = Number(item.lng);
    if (!isNaN(numLat) && numLat !== 0 && !isNaN(numLng) && numLng !== 0) {
      return { lat: numLat, lng: numLng };
    }

    const rawText = `${item.location || ""} ${item.name || ""}`.trim();
    const textLower = rawText.toLowerCase();

    // Generic stop check for intermediate waypoints
    const hasGenericIndex = /#\d+|stop\s*\d+|waypoint\s*\d+|hub\s*\d+|viewpoint\s*\d+/i.test(rawText);
    if (!isFirst && !isLast && hasGenericIndex) {
      return null;
    }

    const direct = lookupSingleCoordinate(rawText);
    if (direct) {
      // Invalidate intermediate direct matches that match source or destination coordinates
      if (!isFirst && !isLast) {
        if (sourceCoords && Math.abs(direct.lat - sourceCoords.lat) < 0.05 && Math.abs(direct.lng - sourceCoords.lng) < 0.05) {
          return null;
        }
        if (destCoords && Math.abs(direct.lat - destCoords.lat) < 0.05 && Math.abs(direct.lng - destCoords.lng) < 0.05) {
          return null;
        }
      }

      const hash = textLower.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const jitterLat = ((hash % 100) / 10000) - 0.005;
      const jitterLng = (((hash >> 2) % 100) / 10000) - 0.005;
      return { lat: direct.lat + jitterLat, lng: direct.lng + jitterLng };
    }

    return null;
  });

  // Pass 2: Linearly interpolate missing points between known anchor points
  const result: Array<{ lat: number; lng: number }> = [];

  // Find all indices that have known coordinates
  const knownIndices: number[] = [];
  resolved.forEach((coords, idx) => {
    if (coords) knownIndices.push(idx);
  });

  for (let i = 0; i < items.length; i++) {
    if (resolved[i]) {
      result.push(resolved[i]!);
      continue;
    }

    // Find previous known index and next known index
    const prevKnown = knownIndices.filter((idx) => idx < i).pop();
    const nextKnown = knownIndices.find((idx) => idx > i);

    if (prevKnown !== undefined && nextKnown !== undefined) {
      // Interpolate linearly between prevKnown and nextKnown!
      const startCoord = resolved[prevKnown]!;
      const endCoord = resolved[nextKnown]!;
      const fraction = (i - prevKnown) / (nextKnown - prevKnown);

      const hash = items[i].name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const latJitter = ((hash % 10) - 5) / 1000;
      const lngJitter = (((hash >> 2) % 10) - 5) / 1000;

      result.push({
        lat: startCoord.lat + fraction * (endCoord.lat - startCoord.lat) + latJitter,
        lng: startCoord.lng + fraction * (endCoord.lng - startCoord.lng) + lngJitter,
      });
    } else if (prevKnown !== undefined) {
      // Extrapolate beyond prevKnown
      const startCoord = resolved[prevKnown]!;
      const stepIndex = i - prevKnown;
      const hash = items[i].name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const latStep = 0.12 + ((hash % 5) / 100);
      const lngStep = 0.08 + (((hash >> 2) % 5) / 100);
      result.push({
        lat: startCoord.lat + stepIndex * latStep,
        lng: startCoord.lng + stepIndex * lngStep,
      });
    } else if (nextKnown !== undefined) {
      // Prepend before nextKnown
      const endCoord = resolved[nextKnown]!;
      const stepIndex = nextKnown - i;
      const hash = items[i].name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const latStep = 0.12 + ((hash % 5) / 100);
      const lngStep = 0.08 + (((hash >> 2) % 5) / 100);
      result.push({
        lat: endCoord.lat - stepIndex * latStep,
        lng: endCoord.lng - stepIndex * lngStep,
      });
    } else {
      // Fallback center
      const textLower = (items[i].name + " " + (items[i].location || "")).toLowerCase();
      const isIndian = !textLower.includes("nepal") && !textLower.includes("pokhara") && !textLower.includes("kathmandu");
      const baseCenter = isIndian ? { lat: 22.7196, lng: 75.8577 } : { lat: 28.2096, lng: 83.9856 };
      result.push({
        lat: baseCenter.lat + (i * 0.1),
        lng: baseCenter.lng + (i * 0.1),
      });
    }
  }

  return result;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedId,
  onMarkerClick,
  center = { lat: 28.2096, lng: 83.9856 },
  drawPolyline = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const routeLayersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLoaded(true);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers & route layers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    routeLayersRef.current.forEach((layer) => layer.remove());
    routeLayersRef.current = [];

    if (items.length === 0) return;

    // Batch resolve coordinates with linear interpolation for unmapped intermediate waypoints
    const allCoords = resolveAllItemCoordinates(items);
    const group: [number, number][] = [];

    items.forEach((item, index) => {
      const coords = allCoords[index];
      const itemLat = coords.lat;
      const itemLng = coords.lng;

      const isSelected = String(item.id) === String(selectedId);
      const color = item.category === "restaurant" ? "#f97316" : item.category === "transport" ? "#10b981" : "#2563eb";

      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="
            background: ${isSelected ? "#dc2626" : color};
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
            transition: all 0.2s;
          ">
            <span>📍 ${index + 1}</span>
            <span>${item.priceTag || ""}</span>
          </div>
        `,
        iconSize: [90, 30],
        iconAnchor: [45, 15],
      });

      const marker = L.marker([itemLat, itemLng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          ${item.image ? `<img src="${item.image}" style="width:100%; height:80px; object-fit:cover; border-radius:8px; margin-bottom:6px;"/>` : ""}
          <strong style="font-size: 13px; color: #0f172a; display:block;">${item.name}</strong>
          <div style="font-size: 11px; color: #64748b; margin-top:2px;">📍 ${item.location || "Location"}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size: 12px; font-weight:bold; color: #16a34a;">${item.priceTag || ""}</span>
            <span style="font-size: 11px; color: #f59e0b; font-weight:bold;">★ ${item.rating || 4.8}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onMarkerClick(String(item.id));
      });

      markersRef.current[String(item.id)] = marker;
      group.push([itemLat, itemLng]);
    });

    // Draw Proper Road Routes using OSRM Driving Route API (with alternative routes)
    if (drawPolyline && group.length > 1) {
      const drawFallback = () => {
        const fallbackPoly = L.polyline(group, {
          color: "#2563eb",
          weight: 5,
          opacity: 0.85,
          dashArray: "6, 8",
        }).addTo(map);
        routeLayersRef.current.push(fallbackPoly);
      };

      // OSRM expects waypoints in lon,lat order separated by semicolons
      const osrmWaypoints = group.map((pt) => `${pt[1]},${pt[0]}`).join(";");
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmWaypoints}?overview=full&geometries=geojson&alternatives=true`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
            // Draw alternative routes first (if present)
            for (let r = data.routes.length - 1; r >= 1; r--) {
              const route = data.routes[r];
              if (route.geometry && Array.isArray(route.geometry.coordinates)) {
                const lineCoords = route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
                const altLine = L.polyline(lineCoords, {
                  color: r === 1 ? "#0284c7" : "#64748b",
                  weight: 4,
                  opacity: 0.75,
                  dashArray: "8, 8",
                }).addTo(map);

                const distKm = (route.distance / 1000).toFixed(0);
                const durHours = (route.duration / 3600).toFixed(1);
                altLine.bindTooltip(`🛣️ Alternative Route #${r} (${distKm} km • ~${durHours}h)`, { sticky: true });
                routeLayersRef.current.push(altLine);
              }
            }

            // Draw main primary driving route on top
            const primaryRoute = data.routes[0];
            if (primaryRoute.geometry && Array.isArray(primaryRoute.geometry.coordinates)) {
              const mainLineCoords = primaryRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
              const mainLine = L.polyline(mainLineCoords, {
                color: "#2563eb",
                weight: 6,
                opacity: 0.9,
              }).addTo(map);

              const distKm = (primaryRoute.distance / 1000).toFixed(0);
              const durHours = (primaryRoute.duration / 3600).toFixed(1);
              mainLine.bindTooltip(`🚗 Main Driving Route (${distKm} km • ~${durHours}h)`, { sticky: true });
              routeLayersRef.current.push(mainLine);
            } else {
              drawFallback();
            }
          } else {
            drawFallback();
          }
        })
        .catch((err) => {
          console.warn("OSRM routing fetch warning, drawing interpolated path:", err);
          drawFallback();
        });
    }

    if (selectedId && markersRef.current[String(selectedId)]) {
      const selMarker = markersRef.current[String(selectedId)];
      const latLng = selMarker.getLatLng();
      map.setView([latLng.lat, latLng.lng], 13, { animate: true });
      selMarker.openPopup();
    } else if (group.length > 0) {
      if (group.length === 1) {
        map.setView(group[0], 11);
      } else {
        const bounds = L.latLngBounds(group);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [loaded, items, selectedId, center, onMarkerClick, drawPolyline]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
      <div ref={containerRef} className="w-full h-full z-10" style={{ minHeight: "450px" }} />
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading Map...</span>
          </div>
        </div>
      )}
      {loaded && items.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 z-[1000] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{items.length} Location Pin{items.length > 1 ? 's' : ''} Displayed</span>
        </div>
      )}
    </div>
  );
};
