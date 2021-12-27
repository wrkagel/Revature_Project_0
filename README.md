# Project Zero
- Test project. Not a safe application for practical use.
## BankingApp
- This runs a simple express.js web server that is designed for banking operations.
- It uses an Azure CosmosDB as the database where client and account information is stored.
### Client operations
- Create a client
- Update a client
    - Cannot be used to update the accounts of a client.
- Get all clients or a specific client by id.
- Delete a client
### Account operations
- Create an account
    - Account must be attached to a client.
- Get all accounts for a client, a specific account by name, or a range of accounts based on the balance amount
- Withdraw from an account
- Deposit to an account
- Delete an account