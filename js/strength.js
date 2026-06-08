/**
 * strength.js - Core password strength analysis functions
 * Handles entropy calculation, pattern detection, and alternative generation
 */

const PasswordStrength = (function() {
    
    // Character set sizes for entropy calculation
    const CHAR_SETS = {
        lowercase: 26,
        uppercase: 26,
        digits: 10,
        special: 33
    };
    
    // Common patterns to detect
    const PATTERNS = [
        /12345/, /qwert/, /asdfg/, /zxcvb/, /abcde/, /admin/, /password/,
        /ilove/, /monkey/, /dragon/, /master/, /sunshine/, /football/, /baseball/,
        /passw0rd/, /letmein/, /trustno1/, /welcome/, /shadow/
    ];
    
    // Words for passphrase generation
    const WORD_LIST = ['Blue', 'Tiger', 'River', 'Storm', 'Phoenix', 'Jazz', 'Mountain', 'Eagle', 
                       'Forest', 'Ocean', 'Thunder', 'Lightning', 'Crystal', 'Shadow', 'Flame'];
    
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const COLORS = ['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Purple', 'Orange', 'Teal'];
    
    function calculateEntropy(password) {
        if (!password || password.length === 0) {
            return { bits: 0, crackTime: '0s', total: 0, level: 'none' };
        }
        
        let charsetSize = 0;
        let hasLower = /[a-z]/.test(password);
        let hasUpper = /[A-Z]/.test(password);
        let hasDigit = /[0-9]/.test(password);
        let hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        if (hasLower) charsetSize += CHAR_SETS.lowercase;
        if (hasUpper) charsetSize += CHAR_SETS.uppercase;
        if (hasDigit) charsetSize += CHAR_SETS.digits;
        if (hasSpecial) charsetSize += CHAR_SETS.special;
        
        if (charsetSize === 0) return { bits: 0, crackTime: '0s', total: 0, level: 'none' };
        
        const entropyPerChar = Math.log2(charsetSize);
        const totalEntropy = password.length * entropyPerChar;
        
        const combinations = Math.pow(charsetSize, password.length);
        let seconds = combinations / 1000000000;
        
        let crackTime;
        if (seconds < 1) crackTime = '< 1 second';
        else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
        else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
        else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
        else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
        else if (seconds < 3153600000) crackTime = `${(seconds / 31536000).toFixed(1)} years`;
        else crackTime = 'Centuries+';
        
        let level = 'weak';
        if (totalEntropy >= 80) level = 'strong';
        else if (totalEntropy >= 60) level = 'good';
        else if (totalEntropy >= 40) level = 'medium';
        
        return {
            bits: totalEntropy.toFixed(1),
            crackTime: crackTime,
            total: totalEntropy,
            level: level,
            hasLower, hasUpper, hasDigit, hasSpecial,
            charsetSize: charsetSize
        };
    }
    
    function hasCommonPattern(password) {
        const lower = password.toLowerCase();
        return PATTERNS.some(pattern => pattern.test(lower));
    }
    
    function hasRepeatedChars(password) {
        return /(.)\1{2,}/.test(password);
    }
    
    function hasSequentialChars(password) {
        const lower = password.toLowerCase();
        for (let i = 0; i < lower.length - 3; i++) {
            const a = lower.charCodeAt(i);
            const b = lower.charCodeAt(i + 1);
            const c = lower.charCodeAt(i + 2);
            if (b === a + 1 && c === a + 2) return true;
        }
        return false;
    }
    
    function evaluateCriteria(password) {
        const criteria = {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            digit: /[0-9]/.test(password),
            special: /[^a-zA-Z0-9]/.test(password),
            noPattern: !hasCommonPattern(password),
            noRepeats: !hasRepeatedChars(password),
            noSequential: !hasSequentialChars(password)
        };
        
        let score = 0;
        const mainCriteria = ['length', 'lower', 'upper', 'digit', 'special', 'noPattern'];
        for (const key of mainCriteria) {
            if (criteria[key]) score++;
        }
        
        const percentage = (score / mainCriteria.length) * 100;
        
        let rating = 'weak';
        if (percentage >= 80) rating = 'strong';
        else if (percentage >= 60) rating = 'medium';
        
        return {
            criteria,
            score,
            maxScore: mainCriteria.length,
            percentage,
            rating
        };
    }
    
    function calculateFinalStrength(criteriaResult, isBreached) {
        let finalScore = criteriaResult.percentage;
        
        if (isBreached) {
            finalScore = Math.min(finalScore, 20);
            return {
                score: finalScore,
                level: 'critical',
                label: 'CRITICAL - BREACHED',
                color: '#f44336',
                message: 'This password appears in known data breaches!'
            };
        }
        
        if (finalScore >= 80) {
            return {
                score: finalScore,
                level: 'strong',
                label: 'STRONG',
                color: '#4caf50',
                message: 'Excellent password!'
            };
        } else if (finalScore >= 60) {
            return {
                score: finalScore,
                level: 'medium',
                label: 'MEDIUM',
                color: '#ff9800',
                message: 'Decent, but can be improved.'
            };
        } else {
            return {
                score: finalScore,
                level: 'weak',
                label: 'WEAK',
                color: '#f44336',
                message: 'Too weak. Improve complexity and length.'
            };
        }
    }
    
    function generateAlternatives(password, criteria) {
        const alternatives = [];
        
        // Alt 1: Fix missing character types
        let alt1 = password;
        if (!criteria.upper) alt1 = alt1.charAt(0).toUpperCase() + alt1.slice(1);
        if (!criteria.digit) alt1 = alt1 + Math.floor(Math.random() * 90 + 10);
        if (!criteria.special) alt1 = alt1 + ['!', '@', '#', '$', '%'][Math.floor(Math.random() * 5)];
        if (!criteria.length && alt1.length < 12) alt1 = alt1 + alt1.slice(-2) + '26';
        
        // Alt 2: Passphrase style
        const word1 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        const word2 = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        const numbers = Math.floor(Math.random() * 900) + 100;
        const symbols = ['!', '@', '#', '$', '%', '&', '*'][Math.floor(Math.random() * 7)];
        const alt2 = `${word1}${word2}${numbers}${symbols}`;
        
        // Alt 3: Leetspeak transformation
        let alt3 = password;
        alt3 = alt3.replace(/a/gi, '@').replace(/e/gi, '3').replace(/i/gi, '1').replace(/o/gi, '0').replace(/s/gi, '$');
        if (!/[A-Z]/.test(alt3)) alt3 = alt3.charAt(0).toUpperCase() + alt3.slice(1);
        if (!/\d/.test(alt3)) alt3 = alt3 + '2026';
        if (!/[!@#$%^&*]/.test(alt3)) alt3 = alt3 + '!';
        
        // Alt 4: Memorable phrase
        const month = MONTHS[Math.floor(Math.random() * MONTHS.length)];
        const year = Math.floor(Math.random() * 10) + 2025;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const alt4 = `${color}${month}${year}!`;
        
        // Alt 5: Random strong (14 chars)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let alt5 = '';
        for (let i = 0; i < 14; i++) {
            alt5 += chars[Math.floor(Math.random() * chars.length)];
        }
        
        const allAlts = [alt1, alt2, alt3, alt4, alt5];
        const uniqueAlts = [...new Set(allAlts)];
        
        return uniqueAlts.slice(0, 4).map(alt => ({
            password: alt,
            entropy: calculateEntropy(alt).total,
            length: alt.length
        }));
    }
    
    return {
        calculateEntropy,
        hasCommonPattern,
        hasRepeatedChars,
        hasSequentialChars,
        evaluateCriteria,
        calculateFinalStrength,
        generateAlternatives
    };
})();
