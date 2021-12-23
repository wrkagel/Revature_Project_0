// Error that indicates the JSON object contained in the body of a request does not have the correct form.

export default class InvalidBodyObject extends Error {

    constructor(message:string){
        super(message);
    }
}