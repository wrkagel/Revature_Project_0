/*
    Things to do.
    Add in proper response codes for errors beyond 404 Not Found.
    Ask Adam about how updateClient should function.
*/

import express from 'express';
import Client from './entities/client';
import Account from './entities/account';
import ClientDAO, { ClientDao } from './daos/client-dao';
import BankingServices, { BankingServicesImpl } from './services/banking-services';
import NotFoundError from './errors/notFoundError';
import { Response } from 'express-serve-static-core';

// Create app and designate port
const app = express();
const port = 3000;

// Create account handler
const clientDao:ClientDAO = new ClientDao();
const accountServices:BankingServices = new BankingServicesImpl(clientDao);

// Ensure that the body of requests is automatically converted into a JSON object.
app.use(express.json());

// Route to create a new client. Body should contain a JSON for a client;
app.post('/clients', async (req, res) => {
    try {   
        const client:Client = req.body;
        await accountServices.createClient(client);
        res.status(201);
        res.send(client);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Create a new account. Body should contain a JSON for the new account.
app.post('/clients/:id/accounts', async (req, res) => {
    try {
        const account:Account = req.body;
        await accountServices.createAccount(account, req.params.id);
        res.status(201);
        res.send(account);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Return all clients
app.get('/clients', async (req, res) => {
    try {
        const clients:Client[] = await accountServices.getAllClients();
        res.send(clients);  
    } catch (error) {
        errorHandler(res, error);
    }
});

// Return a client based on their id
app.get('/clients/:id', async (req, res) => {
    try {
        const client:Client = await accountServices.getClient(req.params.id);
        res.send(client);
    } catch (error) {
        errorHandler(error, res);
    }
});

// Return all accounts for a given client. Use amounts for range of accounts if specified.
app.get('clients/:id/accounts', async (req, res) => {
    try {
        const {amountLessThan = null, amountGreaterThan = null} = req.query;
        const {id} = req.params;
        if(amountLessThan || amountGreaterThan) {
            const accounts: Account[] = await accountServices.getAccountRange(amountGreaterThan.toString(), amountLessThan.toString(), id);
            res.send(accounts);
        } else {
            const accounts:Account[] =  await accountServices.getAllAccounts(req.params.id);
            res.send(accounts);
        }
    } catch (error) {
        errorHandler(res, error);
    }
});

// Return the named account for the given client
app.get(`clients/:id/accounts/:accName`, async (req, res) => {
    try {
        const {id, accName} = req.params;
        const account:Account = await accountServices.getAccount(id, accName);
        res.send(account);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Replace the given client with the client in the body of the request
app.put('/clients/:id', async (req, res) => {
    try {
        const id:string = req.params.id;
        const client:Client = req.body;
        const result:Client = await accountServices.updateClient(id, client);
        res.send(result);
    } catch (error) {
        errorHandler(res, error);
    }
});

// Deposit money into an account
app.patch('/clients/:id/accounts/:accName/deposit', async (req, res) => {
    try {
        const {id, accName} = req.params;
        const {amount} = req.body;
        const result:Account = await accountServices.deposit(amount, id, accName);
        res.send(result);
    } catch (error) {
        errorHandler(res, error);
    }

});

// Withdraw money from an account
app.patch('/clients/:id/accounts/:accName/withdraw', async (req, res) => {
    try {
        const {id, accName} = req.params;
        const {amount} = req.body;
        const result:Account = await accountServices.withdraw(amount, id, accName);
        res.send(result);        
    } catch (error) {
        errorHandler(res, error);
    }
});

app.delete('clients/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const result:boolean = await accountServices.deleteClient(id);
        res.send(`The deletion of ${id} has ${result ? 'succeeded' : 'failed'}.`);
    } catch (error) {
        errorHandler(res, error);
    }
});

app.listen(port, () => console.log('The application is running'));

function errorHandler(error: any, res: Response<any, Record<string, any>, number>) {
    if (error instanceof NotFoundError) {
        console.log(error);
        console.log(error.stack);
        res.status(404);
        res.send(error.message);
    } else {
        res.status(500);
        console.log(error);
        console.log(error.stack);
        res.send('Unknown server error.');
    }
}
