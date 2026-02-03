export class Customer {
    constructor(
        public readonly id: string,
        public fullName: string,
        public email: string,
        public phoneNumber: string,
        public address: string,
        public city: string,
    ) { }
}
