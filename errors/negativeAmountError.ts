export default class NegativeAmountError extends Error {

    constructor(message:string, 
        public id:string, 
        public accountName:string) {
        super(message);
    };
    
}