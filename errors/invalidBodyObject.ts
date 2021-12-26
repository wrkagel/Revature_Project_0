// Error that indicates the JSON contained in the body of a request is missing required parameters.

export default class InvalidBodyObject extends Error {

    constructor(message:string){
        super(message);
    }
}