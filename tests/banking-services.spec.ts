import ClientDAO, { ClientDao } from "../daos/client-dao";
import Account from "../entities/account";
import Client from "../entities/client";
import NegativeAmountError from "../errors/negativeAmountError";
import NotFoundError from "../errors/notFoundError";
//import OverdrawError from "../errors/negativeBalanceError";
import BankingServices, { BankingServicesImpl } from "../services/banking-services";

//Only account services are tested here, since all client functions are passed directly to the DAO.
describe("Banking Services Tests", () => {

    // Since accounts must have a client a client is created first.
    const clientDao:ClientDAO = new ClientDao();
    const bankingServices:BankingServices = new BankingServicesImpl(clientDao);
    let client:Client = {
        id: "",
        fname: "Harvey",
        lname: "Steve Joe",
        accounts: []
    };
    let savedAccount:Account = null;
    let savedAccount2:Account = null;

    it("should create an account.", async () => {
        client = await bankingServices.createClient(client);
        const account:Account = {accName:"beerMoney", balance:400};
        savedAccount = await bankingServices.createAccount(account, client.id);
        expect(savedAccount).toEqual(account);
        //Create a second account for further testing.
        savedAccount2 = await bankingServices.createAccount({accName:"moneyBag", balance:2}, client.id);
    });

    it("should return all accounts for a client", async () => {
        const returnedAccounts:Account[] = await bankingServices.getAllAccounts(client.id);
        expect(returnedAccounts).toContainEqual(savedAccount);
        expect(returnedAccounts).toContainEqual(savedAccount2);
    });

    it("should return all accounts with 5 <= balance <= 401", async () => {
        const returnedAccounts:Account[] = await bankingServices.getAccountRange(5, 401, client.id);
        expect(returnedAccounts[0]).toEqual(savedAccount);
    });

    it("should return the first saved account.", async () => {
        const returnedAccount:Account = await bankingServices.getAccount(client.id, savedAccount.accName);
        expect(returnedAccount).toEqual(savedAccount);
    });

    it("should deposit 100 into the \'beerMoney\' account.", async () => {
        const returnedAccount:Account = await bankingServices.deposit(100, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(500);
    });

    it("should throw an error for having a negative deposit amount.", async () => {
        try {
            await bankingServices.deposit(-20, client.id, 'beerMoney');
        } catch (error) {
            expect(error).toBeInstanceOf(NegativeAmountError);   
        }
    });

    it("should withdraw 499 from \'beerMoney\' account.", async () => {
        const returnedAccount:Account = await bankingServices.withdraw(499, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(1);
    });

    it("should throw an error for negative balance after withdraw.", async () => {
        try {
            await bankingServices.withdraw(5, client.id, 'moneyBag')
        } catch (error) {
            expect(error).toBeInstanceOf(NegativeAmountError);
        }
    });

    // Deleting both test accounts to avoid altering database.
    it("should delete the account.", async () => {
        const result:Client = await bankingServices.deleteAccount(client.id, savedAccount.accName);
        await bankingServices.deleteAccount(client.id, savedAccount2.accName);
        expect(result.accounts).toEqual([savedAccount2]);
        try {
            await bankingServices.getAccount(client.id, savedAccount.accName);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("should show that updating the client does not change account details.", async () => {
        const account:Account = {accName:"This shouldn't exist", balance:1000000000};
        client.accounts.push(account);
        const arr:Account[] = await bankingServices.getAllAccounts(client.id);
        expect(arr).toHaveLength(0);
        // Delete the client now that the test is over.
        await bankingServices.deleteClient(client.id);
    });

});