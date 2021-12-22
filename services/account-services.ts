import Account from "../entities/account";
import ClientDAO from "../daos/client-dao";

export default interface AccountServices{
    //Create
    createAccount(account:Account, id:string):Promise<Account>;
    //Read
    getAllAccounts(id:string):Promise<Account[]>
    getAccountRange(amountGreaterThan:string, amountLessThan:string):Promise<Account[]>;
    getAccount(clientID:string, name:string):Promise<Account>;
    //Update
    updateAccount(account:Account):Promise<Account>;
    deposit(amount:number, clientID:String, name:string):Promise<Account>;
    withdraw(amount:number, clientID:String, name:string):Promise<Account>;
    //Delete
    deleteAccount(clientID:string, name:string):Promise<Account>;
}

export class AccountServicesImpl implements AccountServices{

    constructor(private clientDAO:ClientDAO){};

    createAccount(account: Account, id:string): Promise<Account> {

        throw new Error("Method not implemented.");
    }
    getAllAccounts(id:string): Promise<Account[]> {
        throw new Error("Method not implemented.");
    }
    getAccountRange(amountGreaterThan:string, amountLessThan:string): Promise<Account[]> {
        throw new Error("Method not implemented.");
    }
    getAccount(clientID: string, name: string): Promise<Account> {
        throw new Error("Method not implemented.");
    }
    updateAccount(account: Account): Promise<Account> {
        throw new Error("Method not implemented.");
    }
    deposit(amount: number, clientID:string, name:string): Promise<Account> {
        throw new Error("Method not implemented.");
    }
    withdraw(amount: number, clientID:string, name:string): Promise<Account> {
        throw new Error("Method not implemented.");
    }
    deleteAccount(clientID: string, name: string): Promise<Account> {
        throw new Error("Method not implemented.");
    }

}