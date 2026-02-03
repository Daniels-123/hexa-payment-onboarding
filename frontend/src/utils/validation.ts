export const validateCardNumber = (number: string): boolean => {
    // Luhn Algorithm
    const regex = new RegExp("^[0-9]{16}$");
    if (!regex.test(number)) return false;

    return luhnCheck(number);
};

const luhnCheck = (val: string) => {
    let sum = 0;
    for (let i = 0; i < val.length; i++) {
        let intVal = parseInt(val.substr(i, 1));
        if (i % 2 === 0) {
            intVal *= 2;
            if (intVal > 9) {
                intVal = 1 + (intVal % 10);
            }
        }
        sum += intVal;
    }
    return (sum % 10) === 0;
};

export const getCardType = (number: string): 'VISA' | 'MASTERCARD' | 'UNKNOWN' => {
    if (number.startsWith('4')) return 'VISA';
    if (number.startsWith('5')) return 'MASTERCARD'; // Simplified
    return 'UNKNOWN';
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
};
