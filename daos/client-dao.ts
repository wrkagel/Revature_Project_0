import { CosmosClient } from "@azure/cosmos";
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
    deleteClient(id:string):Promise<Client>;
}

const client:CosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION);
const database = client.database('wk-revature-project0-db');
const container = database.container('Clients');

export class ClientDao implements ClientDAO{

    async createClient(client: Client): Promise<Client> {
        client.id = v4();
        client.accounts = [];
        const response = await container.items.create<Client>(client);
        const savedClient:Client = response.resource;
        const {id, fname, lname, accounts} = savedClient;
        return {id, fname, lname, accounts};
    }

    async getAllClients(): Promise<Client[]> {
        const response = await container.items.readAll<Client>().fetchAll();
        const clients:Client[] = response.resources;
        const result:Client[] = clients.map<Client>(client => {
            const {id, fname, lname, accounts} = client;
            return {id, fname, lname, accounts};
        });
        return result;
    }

    async getClient(clientId: string): Promise<Client> {
        const response = await container.item(clientId, clientId).read<Client>();
        const client:Client = response.resource;
        if(!client) {
            throw new NotFoundError(`ID:${clientId} returned 0 clients`, clientId);
        }
        const {id, fname, lname, accounts} = client;
        return {id, fname, lname, accounts};
    }

    async updateClient(clientId:string , client:Client): Promise<Client> {
        client.id = clientId;
        const response = await container.items.upsert<Client>(client);
        const savedClient:Client = response.resource;
        const {id, fname, lname, accounts} = savedClient;
        return {id, fname, lname, accounts};
    }
    
    async deleteClient(clientId: string): Promise<Client> {
        const item = container.item(clientId, clientId);
        const client:Client = (await item.read<Client>()).resource;
        if(!client) {
            throw new NotFoundError(`Client ${clientId} does not exist in the system`, clientId);
        }
        await item.delete();
        return client;
    }

}