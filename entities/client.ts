import Account from "./account";

// Defines a client.
export default interface Client{
    id:string;
    fname:string;
    lname:string;
    accounts:Account[];
}