//Contains all business logic and calls to the clientDAO.

import Account from "../entities/account";
import ClientDAO from "../daos/client-dao";
import Client from "../entities/client";
import NegativeAmountError from "../errors/negativeAmountError";
import NotFoundError from "../errors/notFoundError";

export default interface BankingServices{
    //Create
    createClient(client:Client):Promise<Client>;
    createAccount(account:Account, id:string):Promise<Account>;
    //Read
    getAllClients():Promise<Client[]>;
    getClient(clientId:string):Promise<Client>;
    getAllAccounts(id:string):Promise<Account[]>
    getAccountRange(amountGreaterThan:number, amountLessThan:number, clientId:string):Promise<Account[]>;
    getAccount(clientId:string, name:string):Promise<Account>;
    //Update
    updateClient(clientId:string, client:Client):Promise<Client>;
    deposit(amount:number, clientId:String, name:string):Promise<Account>;
    withdraw(amount:number, clientId:String, name:string):Promise<Account>;
    //Delete
    deleteClient(clientId:string):Promise<boolean>;
    deleteAccount(clientID:string, name:string):Promise<Client>;
}

export class BankingServicesImpl implements BankingServices{

    //Dependency injection
    constructor(private clientDAO:ClientDAO){}
    
    // Client methods passed directly to clientDAO except updateClient.
    // updateClient() contains extra logic to ensure accounts are not updated with updateClient.

    createClient(client: Client) {
        return this.clientDAO.createClient(client);
    }

    async getAllClients() {
        return this.clientDAO.getAllClients();
    }
    
    async getClient(clientId: string) {
        return this.clientDAO.getClient(clientId);
    }
    
    // Only used for updating client information. Do not use for updating account information.
    // Doesn't throw an error for account changes. Just doesn't do them.
    async updateClient(clientId: string, client: Client) {
        const oldClient:Client = await this.clientDAO.getClient(clientId);
        client.id = oldClient.id;
        client.accounts = oldClient.accounts;
        return this.clientDAO.updateClient(clientId, client);
    }
    
    async deleteClient(clientId: string) {
        return this.clientDAO.deleteClient(clientId);
    }
;
    // Account methods

    //Create a new account for the client of the given id.
    async createAccount(account: Account, clientId:string): Promise<Account> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        //Cannot have a negative balance on an account.
        if(client.accounts.findIndex(acc => acc.accName === account.accName) !== -1){
            throw new NegativeAmountError(`Account ${account.accName} for client ${clientId} already exists.`, clientId, account.accName);
        }
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
    
    // Get a range of accounts for the client
    async getAccountRange(amountGreaterThan:number, amountLessThan:number, clientId:string): Promise<Account[]> {
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

    async deleteAccount(clientId: string, name: string): Promise<Client> {
        //If the client doesn't exist a NotFoundError will be thrown
        const client:Client = await this.clientDAO.getClient(clientId);
        const index = client.accounts.findIndex(a=>a.accName === name);
        if(index !== -1) {
            client.accounts.splice(index, 1);
            const result:Client = await this.clientDAO.updateClient(client.id, client);
            return result;
        } else {
            throw new NotFoundError(`Client ${clientId} does not have an account named ${name}`, clientId);
        }
    }

}