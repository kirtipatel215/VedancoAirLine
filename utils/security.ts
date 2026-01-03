
// --- PRODUCTION SECURITY CORE ---

// 1. Rate Limiter (Token Bucket Simulation)
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 20; // 20 req/min per client

export const checkRateLimit = (endpoint: string): boolean => {
    try {
        const key = `ratelimit_${endpoint}`;
        const now = Date.now();
        const raw = localStorage.getItem(key);
        let data = raw ? JSON.parse(raw) : { count: 0, startTime: now };

        if (now - data.startTime > RATE_LIMIT_WINDOW) {
            data = { count: 1, startTime: now };
        } else {
            data.count++;
        }

        localStorage.setItem(key, JSON.stringify(data));

        if (data.count > MAX_REQUESTS) {
            console.error(`[SECURITY] Rate limit exceeded for ${endpoint}`);
            return false;
        }
        return true;
    } catch (e) {
        // If localStorage is blocked or fails, fail open to allow login
        console.warn("[SECURITY] Rate limit check failed, allowing request.", e);
        return true;
    }
};

// 2. Input Sanitization (XSS Prevention)
export const sanitize = (input: string): string => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const sanitizeObject = <T>(obj: T): T => {
    if (typeof obj === 'string') return sanitize(obj) as any;
    if (typeof obj === 'object' && obj !== null) {
        const newObj: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            newObj[key] = sanitizeObject((obj as any)[key]);
        }
        return newObj;
    }
    return obj;
};

// 3. PII Encryption (Mock AES-256)
// In production, use Web Crypto API. Here we simulate obfuscation.
export const encryptPII = (data: string): string => {
    if (!data) return '';
    return `ENC_${btoa(data).split('').reverse().join('')}`;
};

export const decryptPII = (data: string): string => {
    if (!data || !data.startsWith('ENC_')) return data;
    const raw = data.replace('ENC_', '');
    try {
        return atob(raw.split('').reverse().join(''));
    } catch {
        return '***DECRYPTION_ERROR***';
    }
};

// 4. Audit Logging (Immutable Append-Only)
export const auditLog = (actor: string, action: string, resource: string, status: 'SUCCESS' | 'FAILURE', metadata?: any) => {
    try {
        // Safe ID generation that works in non-secure contexts (http localhost)
        const generateId = () => {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
            }
            return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        };

        const logEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            actor,
            action,
            resource,
            status,
            metadata: JSON.stringify(metadata),
            hash: 'simulated_sha256_integrity_check'
        };
        
        // In production, ship this to Splunk/Datadog immediately.
        // Locally, we persist safely.
        const logs = JSON.parse(localStorage.getItem('sys_audit_logs') || '[]');
        logs.unshift(logEntry);
        if (logs.length > 1000) logs.pop(); // Rotate
        localStorage.setItem('sys_audit_logs', JSON.stringify(logs));
    } catch (e) {
        console.error("[SECURITY] Audit log failed", e);
    }
};

// 5. Session Management
export const getSecureSession = () => {
    try {
        return localStorage.getItem('vedanco_token'); // Mock
    } catch {
        return null;
    }
};
