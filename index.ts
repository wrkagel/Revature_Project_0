/*
    Things to do.
    Add in proper response codes for errors beyond 404 Not Found.
    Ask Adam about how updateClient should function.
    Ask Adam about dealing with extra information in the passed object;
*/

import express from 'express';
import Client from './entities/client';
import Account from './entities/account';
import ClientDAO, { ClientDao } from './daos/client-dao';
import BankingServices, { BankingServicesImpl } from './services/banking-services';
import NotFoundError from './errors/notFoundError';
import InvalidBodyObject from './errors/invalidBodyObject';
import NegativeAmountError from './errors/negativeAmountError';

// Create app and designate port
const app = express();
const port = 3000;

// Create account handler
const clientDao:ClientDAO = new ClientDao();
const accountServices:BankingServices = new BankingServicesImpl(clientDao);

// Ensure that the body of requests is automatically converted into a JSON object.
app.use(express.json());

app.route('/clients')
    // Route to create a new client. Body should contain JSON for a client;
    .post(async (req, res, next) => {
        try {
            const {id, fname, lname, accounts} = req.body;
            if (fname === undefined || lname === undefined) {
                throw new InvalidBodyObject(`Client must have a first and last name defined. fname:${fname}, lname:${lname}`);
            }
            const client:Client = await accountServices.createClient({id, fname, lname, accounts});
            res.status(201);
            res.send(client);
        } catch (error) {
            next(error);
        }
    })
    // Return all clients
    .get(async (req, res, next) => {
        try {
            const clients:Client[] = await accountServices.getAllClients();
            res.send(clients);              
        } catch (error) {
            next(error);
        }
    });

app.route('/clients/:id')
    // Replace the given client with the client in the body of the request.
    // 404 Error if client doesn't exist.
    // 406 Error if the id parameter of the body of the request isn't either a blank string or matches the id in the URI.
    .put(async (req, res, next) => {
        try {
            const id:string = req.params.id;
            const {id:id2, fname, lname, accounts} = req.body;
            if(!(id2 === "" || id2 === id)) {
                throw new InvalidBodyObject(`The id of the client object must either be \"\" or match the id of the client in the URL. reqId: ${id}, bodyId: ${id2}`);
            }
            const result:Client = await accountServices.updateClient(id, {id, fname, lname, accounts});
            res.send(result);
        } catch (error) {
            next(error);
        }

    })    
    // Return a client based on their id
    // 404 error if no such client exists
    .get(async (req, res, next) => {
        try {
            const client:Client = await accountServices.getClient(req.params.id);
            res.send(client);    
        } catch (error) {
            next(error);
        }
    })
    // Delete a client based on id.
    // 404 error if no such client exists
    .delete(async (req, res, next) => {
        try {
        const {id} = req.params;
        const result:boolean = await accountServices.deleteClient(id);
        res.status(205);
        res.send(`The deletion of ${id} has ${result ? 'succeeded' : 'failed'}.`);
        } catch (error) {
            next(error);
        }
    });


app.route('/clients/:id/accounts')
    // Create a new account. Body should contain a JSON for the new account.
    // 406 Error if the JSON in the body has no accName and/or balance parameter.
    // 406 Error if the balance parameter is not a number.
    // 422 Error if the balance is a negative number.
    .post(async (req, res, next) => {
        try {
            const {accName, balance} = req.body;
            const numBalance = Number(balance);
            if(!(accName && numBalance)) {
                throw new InvalidBodyObject(`Account must have a name and balance must be a number. accName:${accName}, balance:${balance}`);
            }
            const account = await accountServices.createAccount({accName, balance:numBalance}, req.params.id);
            res.status(201);
            res.send(account);            
        } catch (error) {
            next(error);
        }
    })
    // Return all accounts for a given client. Use amounts for range of accounts if specified.
    // 404 error if no such client exists.
    .get(async (req, res, next) => {
        try {
            const {amountLessThan, amountGreaterThan} = req.query;
            const numAmountLessThan = Number(amountLessThan);
            const numAmountGreaterThan = Number(amountGreaterThan);
            const {id} = req.params;
            if(amountLessThan || amountGreaterThan) {
                const accounts: Account[] = await accountServices.getAccountRange(numAmountGreaterThan, numAmountLessThan, id);
                res.send(accounts);
            } else {
                const accounts:Account[] =  await accountServices.getAllAccounts(req.params.id);
                res.send(accounts);
            }
        } catch (error) {
            next(error);
        }
    });

app.route(`/clients/:id/accounts/:accName`)
// Return the named account for the given client. 
// 404 error if the account doesn't exist.
    .get(async (req, res, next) => {
        try {
            const {id, accName} = req.params;
            const account:Account = await accountServices.getAccount(id, accName);
            res.send(account);
        } catch (error) {
            next(error);
        }
    })
    // Delete an account based on the given id.
    // 404 error if client doesn't exist.
    .delete(async (req, res, next) => {
        try {
            const {id, accName} = req.params;
            const client:Client = await accountServices.deleteAccount(id, accName);
            res.status(205);
            res.send(client);      
        } catch (error) {
            next(error);
        }
    });



// Deposit money into an account. JSON in body of request should have a positive number amount.
// 404 error if the account doesn't exist.
// 422 error if the deposit amount is not positive.
app.patch('/clients/:id/accounts/:accName/deposit', async (req, res, next) => {
    try {
        const {id, accName} = req.params;
        const {amount} = req.body;
        const result:Account = await accountServices.deposit(amount, id, accName);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

// Withdraw money from an account. JSON in body of request should have a positive number amount.
// 
app.patch('/clients/:id/accounts/:accName/withdraw', async (req, res, next) => {
    try {
        const {id, accName} = req.params;
        const {amount} = req.body;
        const result:Account = await accountServices.withdraw(amount, id, accName);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

app.all('/', (req, res, next) => {
    res.status(404);
    res.send(`Invalid route or http request verb. ${req.url}`);
});

// Custom error handler
app.use((err, req, res, next) => {
    if(res.headersSent) {
        return next(err);
    }
    if (err instanceof NotFoundError) {
        res.status(404);
    } else if (err instanceof NegativeAmountError) {
        res.status(422)
    } else if (err instanceof InvalidBodyObject) {
        res.status(406)
    } else  {
        res.status(500);
        console.log(err.message);
        err.message = 'Unknown server error.';
    }
    console.log(err.stack);
    res.send(err.message);
});

app.listen(port, () => console.log('The application is running'));