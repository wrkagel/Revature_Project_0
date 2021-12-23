import Account from "../entities/account";
import ClientDAO from "../daos/client-dao";
import Client from "../entities/client";
import NegativeAmountError from "../errors/negativeAmountError";
import NotFoundError from "../errors/notFoundError";

export default interface AccountServices{
    //Create
    createAccount(account:Account, id:string):Promise<Account>;
    //Read
    getAllAccounts(id:string):Promise<Account[]>
    getAccountRange(amountGreaterThan:string, amountLessThan:string, clientId:string):Promise<Account[]>;
    getAccount(clientId:string, name:string):Promise<Account>;
    //Update
    deposit(amount:number, clientId:String, name:string):Promise<Account>;
    withdraw(amount:number, clientId:String, name:string):Promise<Account>;
    //Delete
    deleteAccount(clientID:string, name:string):Promise<boolean>;
}

export class AccountServicesImpl implements AccountServices{

    //Dependency injection
    constructor(private clientDAO:ClientDAO){};

    //Create a new account for the client of the given id.
    async createAccount(account: Account, clientId:string): Promise<Account> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        //Cannot have a negative balance on an account.
        if(account.balance < 0) {
            throw new NegativeAmountError(`Account ${account.accName} for client ${clientId} cannot be created with a negative balance.`, clientId, account.accName);
        }
        client.accounts.push(account);
        const result:Client = await this.clientDAO.updateClient(client.id, client);
        return result.accounts.find(a=>a.accName===account.accName);
    }

    //Get all accounts for a client
    async getAllAccounts(clientId:string): Promise<Account[]> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        return client.accounts;
    }
    
    async getAccountRange(amountGreaterThan:string, amountLessThan:string, clientId:string): Promise<Account[]> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const numGreatThan = Number(amountGreaterThan);
        const numLessThan = Number(amountLessThan);
         return client.accounts.filter(a => {
            if(numGreatThan && (a.balance < numGreatThan)) return false;
            if(numLessThan && (a.balance > numLessThan)) return false;
            return true; 
        });
    }
    
    async getAccount(clientId: string, name: string): Promise<Account> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const account:Account = client.accounts.find(a=>a.accName===name);
        if(!account) {
            throw new NotFoundError(`Client ${clientId} does not have an account named ${name}`, clientId);
        }
        return account;
    }

    async deposit(amount: number, clientId:string, name:string): Promise<Account> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const account:Account = client.accounts.find(a=>a.accName===name);
        if(!account) {
            throw new NotFoundError(`Client ${clientId} does not have an account named ${name}.`, clientId);
        }
        if(amount <= 0) {
            throw new NegativeAmountError('Deposit amount must be positive.', clientId, name);
        }
        account.balance += amount;
        const result:Client = await this.clientDAO.updateClient(client.id, client);
        return result.accounts.find(a=>a.accName===name);
    }

    async withdraw(amount: number, clientId:string, name:string): Promise<Account> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const account:Account = client.accounts.find(a=>a.accName===name);
        if(!account) {
            throw new NotFoundError(`Client ${clientId} does not have an account named ${name}.`, clientId);
        }
        account.balance -= amount;
        if(amount <= 0) {
            throw new NegativeAmountError('Withdrawal amount must be positive.', clientId, name);
        } else if(account.balance < 0) {
            throw new NegativeAmountError('Attempt to withdraw more than account balance.', clientId, name);
        }
        const result:Client = await this.clientDAO.updateClient(client.id, client);
        return result.accounts.find(a=>a.accName===name);
    }

    async deleteAccount(clientId: string, name: string): Promise<boolean> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const index = client.accounts.findIndex(a=>a.accName === name);
        if(index !== -1) {
            client.accounts.splice(index, 1);
            await this.clientDAO.updateClient(client.id, client);
            return true;
        } else {
            throw new NotFoundError(`Client ${clientId} does not have an account named ${name}`, clientId);
        }
    }

}