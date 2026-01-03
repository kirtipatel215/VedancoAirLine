
import React from 'react';
import { Plane, Wind, Briefcase, Star, Users, Shield, Smartphone, Clock, DollarSign, Map } from 'lucide-react';

export const servicesData = [
    {
        id: 1,
        title: "Private Jet Charter",
        icon: Plane,
        desc: "On-demand access to thousands of aircraft worldwide.",
        fullDesc: "Experience the ultimate freedom of travel with Vedanco's private jet charter. Whether for business or leisure, we provide bespoke air travel solutions tailored to your specific needs. Bypass long queues, enjoy privacy, and fly on your own schedule. Our global network grants you access to light jets for short hops or ultra-long-range airliners for transcontinental journeys.",
        features: ["Global Fleet Access", "24/7 Flight Support", "Pet-Friendly Cabins", "Gourmet Catering", "15-Minute Boarding"],
        image: "https://images.unsplash.com/photo-1619659085985-f51a00f0160a?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
    ,
    {
        id: 2,
        title: "Empty Leg Flights",
        icon: Wind,
        desc: "Exclusive deals on repositioning flights up to 75% off.",
        fullDesc: "Empty legs offer a spontaneous and cost-effective way to fly private. When an aircraft needs to reposition for its next charter, we offer these 'empty' sectors at significantly reduced rates. Enjoy the same luxury experience at a fraction of the cost, perfect for flexible travelers seeking adventure.",
        features: ["Up to 75% Savings", "Last-Minute Availability", "Luxury Experience", "Direct Routes", "Instant Booking"],
        image: "https://images.unsplash.com/photo-1661954864180-e61dea14208a?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    },
    {
        id: 3,
        title: "VIP Ground Transfers",
        icon: Briefcase,
        desc: "Luxury chauffeured transport from doorstep to tarmac.",
        fullDesc: "Your journey begins before you even step on the plane. Our VIP ground transfer service ensures a seamless transition from your home or office to the aircraft steps. Choose from our fleet of luxury sedans and SUVs, driven by professional, vetted chauffeurs who value your privacy and punctuality.",
        features: ["Door-to-Tarmac Service", "Luxury Vehicle Fleet", "Secure & Discrete", "Luggage Assistance", "Multi-Vehicle Convoys"],
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=80"
    },
    {
        id: 4,
        title: "Concierge Services",
        icon: Star,
        desc: "In-flight catering, hotel bookings, and event access.",
        fullDesc: "Vedanco's concierge team goes beyond flight logistics. We curate your entire travel itinerary, securing reservations at Michelin-starred restaurants, booking exclusive suites at top-tier hotels, and gaining you access to sold-out events worldwide. Your dedicated lifestyle manager is just a call away.",
        features: ["Hotel & Villa Booking", "Event Access", "Bespoke Itineraries", "Personal Shopping", "Security Details"],
        image: "https://plus.unsplash.com/premium_photo-1683134374806-9ea735de4b37?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Q29uY2llcmdlJTIwU2VydmljZXN8ZW58MHx8MHx8fDA%3D"
    },
    {
        id: 5,
        title: "Corporate Membership",
        icon: Users,
        desc: "Fixed hourly rates and guaranteed availability for business.",
        fullDesc: "Maximize efficiency with our Corporate Membership program. Designed for frequent flyers, this program offers fixed hourly rates, guaranteed aircraft availability with as little as 24 hours notice, and streamlined billing. Keep your business moving without the hassle of ad-hoc charter negotiations.",
        features: ["Fixed Hourly Rates", "Guaranteed Availability", "No Peak Day Surcharges", "Dedicated Account Manager", "Refundable Deposit"],
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
    },
    {
        id: 6,
        title: "Aircraft Management",
        icon: Shield,
        desc: "Complete operational management for aircraft owners.",
        fullDesc: "Turn your aircraft into a revenue-generating asset. Vedanco offers comprehensive aircraft management services, handling crew staffing, maintenance coordination, regulatory compliance, and charter marketing to offset your ownership costs while ensuring your asset is maintained to the highest safety standards.",
        features: ["Charter Revenue Generation", "Crew Management", "Maintenance Oversight", "Regulatory Compliance", "Cost Optimization"],
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1600&q=80"
    }
];

export const fleetData = [
    {
        id: 'f1',
        name: "Embraer Phenom 300E",
        category: "Light Jet",
        seats: "6-7",
        range: "3,650 km",
        speed: "834 km/h",
        baggage: "74 cu ft",
        cabinHeight: "4 ft 11 in",
        description: "The Phenom 300E sets the standard for the light jet category. With best-in-class climb and field performance, it flies faster and farther than any other jet in its class, offering a spacious cabin with large windows.",
        amenities: ["Enclosed Lavatory", "Refreshment Center", "Club Seating", "WiFi Available"],
        image: "https://images.unsplash.com/photo-1646335554577-67159a904bc6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEVtYnJhZXIlMjBQaGVub20lMjAzMDBFfGVufDB8fDB8fHww"
    },
    {
        id: 'f2',
        name: "Cessna Citation XLS+",
        category: "Mid-Size Jet",
        seats: "8-9",
        range: "3,440 km",
        speed: "815 km/h",
        baggage: "90 cu ft",
        cabinHeight: "5 ft 8 in",
        description: "The Citation XLS+ combines transcontinental range and first-class cabin comfort with remarkable performance efficiency. It is the world's most popular business jet for a reason.",
        amenities: ["Stand-up Cabin", "Full Galley", "Work Tables", "Satellite Phone"],
        image: "https://media.istockphoto.com/id/2247524620/photo/front-three-quarter-view-of-white-modern-business-jet.webp?a=1&b=1&s=612x612&w=0&k=20&c=v5QpDDmxQRin4W7mwx_o8wRzLNRm6sEo2_GzPJ5FZiQ="
    },
    {
        id: 'f3',
        name: "Bombardier Challenger 605",
        category: "Heavy Jet",
        seats: "10-12",
        range: "7,408 km",
        speed: "870 km/h",
        baggage: "115 cu ft",
        cabinHeight: "6 ft 0 in",
        description: "An impressive intercontinental jet with a wide body cabin, the Challenger 605 offers exceptional relaxation and productivity. Perfect for crossing oceans or continents in absolute comfort.",
        amenities: ["Flight Attendant", "Full Berthable Seats", "Hot Meals", "High-Speed Data"],
        image: "https://media.istockphoto.com/id/2247524620/photo/front-three-quarter-view-of-white-modern-business-jet.webp?a=1&b=1&s=612x612&w=0&k=20&c=v5QpDDmxQRin4W7mwx_o8wRzLNRm6sEo2_GzPJ5FZiQ="
    },
    {
        id: 'f4',
        name: "Bombardier Global 7500",
        category: "Ultra-Long Range",
        seats: "14-19",
        range: "14,260 km",
        speed: "982 km/h",
        baggage: "195 cu ft",
        cabinHeight: "6 ft 2 in",
        description: "The industry flagship. The Global 7500 aircraft stands alone as the world's largest and longest range business jet. Within its luxurious interior are four true living spaces, a full size kitchen and a dedicated crew suite.",
        amenities: ["Master Suite with Bed", "Shower", "Dining Area", "Cinema Room"],
        image: "https://media.istockphoto.com/id/2247524620/photo/front-three-quarter-view-of-white-modern-business-jet.webp?a=1&b=1&s=612x612&w=0&k=20&c=v5QpDDmxQRin4W7mwx_o8wRzLNRm6sEo2_GzPJ5FZiQ="
    },
    {
        id: 'f5',
        name: "Gulfstream G650ER",
        category: "Ultra-Long Range",
        seats: "13-19",
        range: "13,890 km",
        speed: "956 km/h",
        baggage: "195 cu ft",
        cabinHeight: "6 ft 5 in",
        description: "The G650ER is the gold standard of business aviation. It flies further and faster than most, connecting cities like Hong Kong and New York non-stop with the lowest cabin altitude in the industry.",
        amenities: ["100% Fresh Air System", "Ka-band WiFi", "Panoramic Windows", "Private Stateroom"],
        image: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1600&q=80"
    },
    {
        id: 'f6',
        name: "Embraer Praetor 600",
        category: "Super-Midsize",
        seats: "8-12",
        range: "7,441 km",
        speed: "863 km/h",
        baggage: "155 cu ft",
        cabinHeight: "6 ft 0 in",
        description: "The Praetor 600 is the world's farthest-flying super-midsize jet. It allows you to fly non-stop from London to New York with class-leading technology and comfort.",
        amenities: ["Full Flat Floor", "Stone Flooring", "HEPA Filter", "Turbulence Reduction"],
        image: "https://images.unsplash.com/photo-1734750438554-7b9ad98c8217?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RW1icmFlciUyMFByYWV0b3IlMjA2MDB8ZW58MHx8MHx8fDA%3D"
    }
];

export const destinationsData = [
    {
        id: 1,
        name: "Dubai, UAE",
        image: "https://plus.unsplash.com/premium_photo-1697729914552-368899dc4757?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHViYWl8ZW58MHx8MHx8fDA%3D",
        desc: "The jewel of the Middle East, offering unparalleled luxury and futuristic architecture.",
        flightTime: "3h 30m"
    },
    {
        id: 2,
        name: "London, UK",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        desc: "A timeless blend of history and modernity, the global hub of business and culture.",
        flightTime: "9h 15m"
    },
    {
        id: 3,
        name: "New York, USA",
        image: "https://images.unsplash.com/photo-1541336032412-2048a678540d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TmV3JTIweW9ya3xlbnwwfHwwfHx8MA%3D%3D",
        desc: "The city of light, fashion, and gastronomy. A romantic getaway like no other.",
        flightTime: "15h 00m"
    },
    {
        id: 4,
        name: "Maldives",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
        desc: "Tropical paradise with crystal clear waters and private island resorts.",
        flightTime: "4h 45m"
    },
    {
        id: 5,
        name: "Paris, France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
        desc: "The city of light, fashion, and gastronomy. A romantic getaway like no other.",
        flightTime: "9h 30m"
    },
    {
        id: 6,
        name: "Tokyo, Japan",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        desc: "A dazzling mix of neon-lit skyscrapers and historic temples.",
        flightTime: "7h 15m"
    },
    {
        id: 7,
        name: "Singapore",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
        desc: "A futuristic garden city ideal for business and luxury shopping.",
        flightTime: "5h 30m"
    },
    {
        id: 8,
        name: "Zurich, Switzerland",
        image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80",
        desc: "The global center for banking and finance, set against the Alps.",
        flightTime: "8h 45m"
    }
];

export const BENEFITS_DATA = [
    {
        id: 'instant',
        title: "Instant Booking",
        icon: Smartphone,
        desc: "Book your flight in minutes with our advanced digital platform.",
        image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 'concierge',
        title: "24/7 Concierge",
        icon: Clock,
        desc: "Dedicated support team available around the clock for any request.",
        image: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 'pricing',
        title: "Transparent Pricing",
        icon: DollarSign,
        desc: "No hidden fees. What you see is exactly what you pay.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 'global',
        title: "Global Reach",
        icon: Map,
        desc: "Access to over 5,000 airports worldwide, remote or major.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 'safety',
        title: "Safety First",
        icon: Shield,
        desc: "We only fly with ARGUS/Wyvern safety-rated operators.",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 'fleet',
        title: "Premium Fleet",
        icon: Plane,
        desc: "From light jets to ultra-long range airliners.",
        image: "https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?auto=format&fit=crop&w=800&q=80"
    }
];
