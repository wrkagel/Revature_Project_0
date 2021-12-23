/*
    Things to do.
    
*/

import express from 'express';
import Client from './entities/client';
import Account from './entities/account';
import ClientDAO, { ClientDao } from './daos/client-dao';
import AccountServices, { AccountServicesImpl } from './services/account-services';

// Create app and designate port
const app = express();
const port = 3000;

// Create DAO objects;
const clientDao:ClientDAO = new ClientDao();
const accountServices:AccountServices = new AccountServicesImpl(clientDao);

// Ensure that the body of requests is automatically converted into a JSON object.
app.use(express.json());

// Route to create a new client. Body should contain a JSON object for a client;
app.post('/clients', async (req, res) => {
    const client:Client = req.body;
    await clientDao.createClient(client);
    res.status(201);
    res.send(client);
});

// Create a new account
app.post('/clients/:id/accounts', async (req, res) => {
    const account:Account = req.body;
    await accountServices.createAccount(account, req.params.id);
    res.status(201);
    res.send(account);
});

// Return all clients
app.get('/clients', async (req, res) => {
    const clients:Client[] = await clientDao.getAllClients();
    return clients;
});

// Return a client based on their id
app.get('/clients/:id', async (req, res) => {
    try {
        const client:Client = await clientDao.getClient(req.params.id);
        res.send(client);
    } catch (error) {
        console.log(error);
        res.status(404);
        res.send('The requested client could not be found');
    }
});

// Return all accounts for a given client
app.get('clients/:id/accounts', async (req, res) => {
    const {amountLessThan = null, amountGreaterThan = null} = req.query;
    if(amountLessThan || amountGreaterThan) {

    } else {
        return await accountServices.getAllAccounts(req.params.id);
    }
});

// Return the named account for the given client
app.get(`clients/:id/accounts/:accName`, async (req, res) => {
    const {id, accName} = req.params;
    const client:Client = await accountServices.getAccount(id, accName);
    res.send(client);
});

// Replace the given client with the client in the body of the request
app.put('/clients/:id', async (req, res) => {
    const id:string = req.params.id;
    const client:Client = req.body;
    const result:Client = await clientDao.updateClient(id, client);
    res.send(result);
});

// Deposit money into an account
app.patch('/clients/:id/accounts/:accName/deposit', async (req, res) => {
    const {id, accName} = req.params;
    const {amount} = req.body;
    const result:Account = await accountServices.deposit(amount, id, accName);
    res.send(result);
});

// Withdraw money from an account
app.patch('/clients/:id/accounts/:accName/withdraw', async (req, res) => {
    const {id, accName} = req.params;
    const {amount} = req.body;
    const result:Account = await accountServices.withdraw(amount, id, accName);
    res.send(result);
});

app.delete('clients/:id', async (req, res) => {
    const {id} = req.params;
    const result:Client = await clientDao.deleteClient(id);
    res.send(result);
})

app.listen(port, () => console.log('The application is running'));