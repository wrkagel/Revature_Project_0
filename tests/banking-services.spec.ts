import ClientDAO, { ClientDao } from "../daos/client-dao";
import Account from "../entities/account";
import Client from "../entities/client";
import NegativeAmountError from "../errors/negativeAmountError";
import NotFoundError from "../errors/notFoundError";
//import OverdrawError from "../errors/negativeBalanceError";
import BankingServices, { BankingServicesImpl } from "../services/banking-services";

describe("Testing for account DAO", () => {

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

    it("Test creating an account.", async () => {
        client = await bankingServices.createClient(client);
        const account:Account = {accName:"beerMoney", balance:400};
        savedAccount = await bankingServices.createAccount(account, client.id);
        expect(savedAccount).toEqual(account);
        //Create a second account for further testing.
        savedAccount2 = await bankingServices.createAccount({accName:"moneyBag", balance:2}, client.id);
    });

    //Add a second account to test getAllAccounts

    it("Test getting all accounts for a client", async () => {
        const returnedAccounts:Account[] = await bankingServices.getAllAccounts(client.id);
        expect(returnedAccounts).toContainEqual(savedAccount);
        expect(returnedAccounts).toContainEqual(savedAccount2);
    });

    it("Test getting an account range", async () => {
        const returnedAccounts:Account[] = await bankingServices.getAccountRange("5", "401", client.id);
        expect(returnedAccounts[0]).toEqual(savedAccount);
    });

    it("Test getting a specific account for a client.", async () => {
        const returnedAccount:Account = await bankingServices.getAccount(client.id, savedAccount.accName);
        expect(returnedAccount).toEqual(savedAccount);
    });

    it("Test depositing to an account.", async () => {
        const returnedAccount:Account = await bankingServices.deposit(100, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(500);
    });

    it("Test withdrawing from an account.", async () => {
        const returnedAccount:Account = await bankingServices.withdraw(499, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(1);
    });

    it("Test error for overdraw attempt.", async () => {
        try {
            await bankingServices.withdraw(5, client.id, 'moneyBag')
        } catch (error) {
            expect(error).toBeInstanceOf(NegativeAmountError);
        }
    });

    // Deleting both test accounts to avoid altering database.
    it("Test deleting an account.", async () => {
        const result:Client = await bankingServices.deleteAccount(client.id, savedAccount.accName);
        await bankingServices.deleteAccount(client.id, savedAccount2.accName);
        expect(result.accounts).toEqual([savedAccount2]);
        try {
            await bankingServices.getAccount(client.id, savedAccount.accName);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("Test that updateClient doesn't change actual account information.", async () => {
        const account:Account = {accName:"This shouldn't exist", balance:1000000000};
        client.accounts.push(account);
        const arr:Account[] = await bankingServices.getAllAccounts(client.id);
        expect(arr).toHaveLength(0);
        await bankingServices.deleteClient(client.id);
    });

});