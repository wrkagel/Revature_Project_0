/*
    Things to do.
    
*/

import express from 'express';

// Create app and designate port
const app = express();
const port = 3000;

//Test interfaces to be changed later when DB is implemented
interface Client {
    name:string
    clientID:number
}

interface Account {
    clientID:number,
    balance:number,
    name:string
}

//Test arrays to be removed later when DB is implemented.
const clients: Client[] =  [];
const accounts: Account[] = [];

// Ensure that the body of requests is automatically converted in a JSON object.
app.use(express.json());

// Create a new client
app.post('/clients', (req, res) => {
    const client:Client = req.body;
    const index = clients.findIndex(el => el.clientID === client.clientID);
    if(index === -1) {
        clients.push(client);
        res.status(201);
        res.send(`Client ${client.clientID} created successfully.`);
    } else {
        res.status(409);
        res.send(`Client ${client.clientID} already exists.`);
    }
});

// Create a new account
app.post('/clients/:id/accounts', (req, res) => {
    const id:Number = Number(req.params.id);
    if(clients.findIndex(el=>el.clientID === id) === -1) {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
        return;
    }
    const account = req.body;
    if(!accounts.find(el=>el.clientID === account.clientID)) {
        accounts.push(account);
        res.status(201);
        res.send(`Account ${account.name} has been created for Client ${id}.`);
    } else {
        res.status(409);
        res.send(`Account ${account.name} already exists for Client ${id}`);
    }
});

// Return all clients
app.get('/clients', (req, res) => {
    res.status(200);
    res.send(clients);
});

// Return a client based on their id
app.get('/clients/:id', (req, res) => {
    const id:number = Number(req.params.id);
    const index = clients.findIndex(el => el.clientID === id);
    if(index !== -1) {
        res.status(200);
        res.send(clients[index]);
    } else {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
    }
});

// Return all accounts for a given client
app.get('clients/:id/accounts', (req, res) => {
    const id = Number(req.params.id);

    if(clients.findIndex(el=>el.clientID === id) === -1) {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
    } else {
        res.status(200);
        res.send(accounts.filter(el=>el.clientID===id));
    }
});

//Ask Adam about this one.
app.get('clients/:id/accounts?amountLessThan=2000&amountGreaterThan400', (req, res) => {

});

// Return the named account for the given client
app.get(`clients/:id/accounts/:name`, (req, res) => {
    const id = Number(req.params.id);
    const name = req.params.name;
    if(clients.findIndex(el=>el.clientID === id) === -1) {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
        return;
    }
    const account = accounts.find(el=>el.name===name);
    if(account){
        res.status(200);
        res.send(account);
    } else {
        res.status(404);
        res.send(`Account ${name} does not exist for Client ${id}`);
    }
});

// Replace the given client with the client in the body of the request
app.put('/clients/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = clients.findIndex(el=>el.clientID===id);
    if(index !== -1) {
        const client = req.body;
        clients[index] = client;
        res.status(200);
        res.send(`Client ${client.clientID} updated succesfully.`);
    } else {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
    }
});

// Update the named account for the given client using the desired action.
app.patch('clients/:id/accounts/:name/:action', (req, res) => {
    const id = Number(req.params.id);
    const name = req.params.name;
    const action = req.params.action;
    if(clients.findIndex(el=>el.clientID === id) === -1) {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
        return;
    }
    const account = accounts.find(el=>el.name===name);
    if(!account) {
        res.status(404);
        res.send(`Account ${name} does not exist for Client ${id}`);
        return;
    }
    const money = req.body;
    if(!money.amount) {
        res.status(400);
        res.send('Request body does not contain a valid amount.');
    }
    switch(action) {
        case "withdraw": {
            if(account.balance >= money.amount){
                account.balance -= money.amount;
                res.status(200);
                res.send(`$${money.amount} withdrawn from account ${name}.`);
            } else {
                res.status(422);
                res.send(`Account ${name} has insuffiecient funds for the withdrawal.`);
            }
            break;
        }
        case "deposit":{
            account.balance += money.amount;
            res.status(200);
            res.send(`Account ${name} balance has been updated.`);
            break;
        }
        default: {
            res.status(404);
            res.send(`The ${action} action is not a valid action.`);
            break;
        }
    }
})

app.delete('clients/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = clients.findIndex(el=>el.clientID===id);
    if(index !== -1) {
        clients.splice(index, 1);
        res.status(205);
        res.send(`Client ${id} deleted succesfully.`);
    } else {
        res.status(404);
        res.send(`Client ${id} does not exist.`);
    }
})



app.listen(port, () => console.log('The application is running'));