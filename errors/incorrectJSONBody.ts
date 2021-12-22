export default class IncorrectJSONBody extends Error {
    constructor(message:string, public expectedFormat:string, public body:string){
        super(message);
    }
}