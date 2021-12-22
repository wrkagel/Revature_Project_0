export default class NotFoundError extends Error {

    constructor(message:string, public id:string) {
        super(message);
    };
    
}