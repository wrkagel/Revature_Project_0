// Denotes that the resource or route/request type for that route was not found.
export default class NotFoundError extends Error {

    constructor(message:string, public id:string) {
        super(message);
    };
    
}