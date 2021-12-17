import express from 'express';

const app = express();
const port = 3000;

// Ensure that the body of requests is automatically converted in a JSON object.
app.use(express.json());

app.post('/clients/:id/accounts', (req, res) => {

});

app.get('/clients', (req, res) => {

});

app.get('/clients/:id', (req, res) => {

});

app.put('/clients/:id', (req, res) => {

});

app.patch('clients/:id/accounts/:accName/:action', (req, res) => {

})

app.delete('clients/:id', (req, res) => {
    
})



app.listen(port, () => console.log('The application is running'));