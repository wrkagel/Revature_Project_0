// Denotes that a withdrawal or deposit is negative or that a withdrawal would cause a negative balance.
export default class NegativeAmountError extends Error {

    constructor(message:string, 
        public id:string, 
        public accountName:string) {
        super(message);
    };
    
}