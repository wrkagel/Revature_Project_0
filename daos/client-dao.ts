// Contains all methods that directly access the database.
// Strips resources of unnecessary information before returning.

import { CosmosClient} from "@azure/cosmos";
import { v4 } from "uuid";
import Client from "../entities/client";
import NotFoundError from "../errors/notFoundError";

export default interface ClientDAO{
    //Create
    createClient(client:Client): Promise<Client>;
    //Read
    getAllClients():Promise<Client[]>;
    getClient(id:string):Promise<Client>;
    //Update
    updateClient(id:string, client:Client):Promise<Client>;
    //Delete
    deleteClient(id:string):Promise<boolean>;
}

export class ClientDao implements ClientDAO{

    private client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION);
    private database = this.client.database('wk-revature-project0-db');
    private container = this.database.container('Clients');

    //Creating a client always sets accounts to an empty array. Accounts must be added separately.
    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        client.accounts = [];
        const response = await this.container.items.create<Client>(client);
        return this.getClientParams(response.resource);
    }

    // Returns all clients currently in the database.
    async getAllClients(): Promise<Client[]> {
        const response = await this.container.items.readAll<Client>().fetchAll();
        const clients:Client[] = response.resources;
        const result:Client[] = clients.map<Client>(client => this.getClientParams(client));
        return result;
    }

    // Returns the client or throws a NotFoundError if no client found.
    async getClient(clientId: string): Promise<Client> {
        const response = await this.container.item(clientId, clientId).read<Client>();
        const client:Client = response.resource;
        if(!client) {
            throw new NotFoundError(`ID:${clientId} returned 0 clients`, clientId);
        }
        return this.getClientParams(client);
    }

    // Updates the client if it exists or throws notFoundError.
    async updateClient(clientId:string , client:Client): Promise<Client> {
        const response = await this.container.item(clientId, clientId).replace(client);
        return this.getClientParams(response.resource);
    }
    
    // Deletes the client if it exists or throws notFoundError.
    async deleteClient(clientId: string): Promise<boolean> {
        //Check if client exists.
        await this.getClient(clientId);
        await this.container.item(clientId, clientId).delete<Client>();
        return true;
    }

    // Strips off all unneeded DB information from the client;
    private getClientParams(client:Client):Client {
        const {id, fname, lname, accounts} = client;
        return {id, fname, lname, accounts};
    }
}