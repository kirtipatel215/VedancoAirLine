
// --- STRICT VALIDATION LAYER ---

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164
const nameRegex = /^[a-zA-Z\s\-\.]{2,50}$/;

export const Validators = {
    email: (email: string) => emailRegex.test(email),
    phone: (phone: string) => phoneRegex.test(phone),
    name: (name: string) => nameRegex.test(name),
    
    passwordStrength: (pwd: string) => {
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        return strongRegex.test(pwd);
    },

    uuid: (id: string) => /^[0-9a-fA-F\-]{36}$/.test(id) || id.startsWith('REQ-') || id.startsWith('B-'), // Allow internal ID formats
    
    dateFuture: (dateStr: string) => {
        const d = new Date(dateStr);
        return d instanceof Date && !isNaN(d.getTime()) && d > new Date();
    },

    required: (val: any) => val !== null && val !== undefined && val !== '',
};

export const Schema = {
    Inquiry: (data: any) => {
        const errors: string[] = [];
        if (!Validators.required(data.from)) errors.push("Origin is required");
        if (!Validators.required(data.to)) errors.push("Destination is required");
        if (!Validators.dateFuture(data.date)) errors.push("Departure date must be in the future");
        if (data.passengers < 1 || data.passengers > 100) errors.push("Invalid passenger count");
        return errors;
    },
    
    Login: (data: any) => {
        const errors: string[] = [];
        if (!Validators.email(data.email)) errors.push("Invalid email format");
        if (!Validators.required(data.password)) errors.push("Password is required");
        return errors;
    },

    KYC: (data: any) => {
        const errors: string[] = [];
        if (!data.declarations?.sourceOfFunds) errors.push("Source of Funds declaration required");
        if (!data.declarations?.amlConsent) errors.push("AML Consent required");
        return errors;
    }
};
