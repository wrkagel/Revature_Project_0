// Denotes that a withdrawal or deposit is negative or that an operation would leave a balance negative.
// Also used when an account is attempted to be created with a negative balance.
export default class NegativeAmountError extends Error {

    constructor(message:string, 
        public id:string, 
        public accountName:string) {
        super(message);
    };
    
}