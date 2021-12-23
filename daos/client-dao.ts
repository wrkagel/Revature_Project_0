// Contains all methods that directly access the database.
// Strips resources of unnecessary information before returning.

import { CosmosClient} from "@azure/cosmos";
import { v4 } from "uuid";
import Client from "../entities/client";
import NotFoundError from "../errors/notFoundError";

export default interface ClientDAO{
    //Create
    createClient(client:Client):Promise<Client>;
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

    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        client.accounts = [];
        const response = await this.container.items.create<Client>(client);
        const savedClient:Client = response.resource;
        const {id, fname, lname, accounts} = savedClient;
        return {id, fname, lname, accounts};
    }

    async getAllClients(): Promise<Client[]> {
        const response = await this.container.items.readAll<Client>().fetchAll();
        const clients:Client[] = response.resources;
        const result:Client[] = clients.map<Client>(client => {
            const {id, fname, lname, accounts} = client;
            return {id, fname, lname, accounts};
        });
        return result;
    }

    async getClient(clientId: string): Promise<Client> {
        const response = await this.container.item(clientId, clientId).read<Client>();
        const client:Client = response.resource;
        if(!client) {
            throw new NotFoundError(`ID:${clientId} returned 0 clients`, clientId);
        }
        const {id, fname, lname, accounts} = client;
        return {id, fname, lname, accounts};
    }

    async updateClient(clientId:string , client:Client): Promise<Client> {
        const response = await this.container.item(clientId, clientId).replace(client);
        const savedClient:Client = response.resource;
        const {id, fname, lname, accounts} = savedClient;
        return {id, fname, lname, accounts};
    }
    
    async deleteClient(clientId: string): Promise<boolean> {
        //Check if client exists.
        await this.getClient(clientId);
        await this.container.item(clientId, clientId).delete<Client>();
        return true;
    }

}