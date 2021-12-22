export default class OverdrawError extends Error {

    constructor(message:string, 
        public id:string, 
        public accountName:string, 
        public balance:number,
        public withdrawalAmount:number) {
        super(message);
    };
    
}