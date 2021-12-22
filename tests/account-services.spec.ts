import ClientDAO, { ClientDao } from "../daos/client-dao";
import Account from "../entities/account";
import Client from "../entities/client";
import NotFoundError from "../errors/notFoundError";
import OverdrawError from "../errors/overdrawError";
import AccountServices, { AccountServicesImpl } from "../services/account-services";

describe("Testing for account DAO", () => {

    const clientDao:ClientDAO = new ClientDao();
    const accountServices:AccountServices = new AccountServicesImpl(clientDao);
    const client:Client = {
        id: "",
        fname: "Harvey",
        lname: "Steve Joe",
        accounts: []
    };
    let savedAccount:Account = null;
    let savedAccount2:Account = null;
    clientDao.createClient(client);

    it("Test creating an account.", async () => {
        const account:Account = {accName:"beerMoney", balance:400};
        savedAccount = await accountServices.createAccount(account, client.id);
        expect(savedAccount).toEqual(account);
        //Create a second account for further testing.
        savedAccount2 = await accountServices.createAccount({accName:"moneyBag", balance:2}, client.id);
    });

    //Add a second account to test getAllAccounts

    it("Test getting all accounts for a client", async () => {
        const returnedAccounts:Account[] = await accountServices.getAllAccounts(client.id);
        expect(returnedAccounts).toContainEqual(savedAccount);
        expect(returnedAccounts).toContainEqual(savedAccount2);
    })

    it("Test getting a specific account for a client.", async () => {
        const returnedAccount:Account = await accountServices.getAccount(client.id, savedAccount.accName);
        expect(returnedAccount).toEqual(savedAccount);
    })

    it("Test getting an account that doesn't exist")

    it("Test depositing to an account.", async () => {
        const returnedAccount:Account = await accountServices.deposit(100, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(500);
    });

    it("Test withdrawing from an account.", async () => {
        const returnedAccount:Account = await accountServices.withdraw(500, client.id, 'beerMoney');
        expect(returnedAccount.balance).toBe(0);
    });

    it("Test error for overdraw attempt.", async () => {
        expect(await accountServices.withdraw(5, client.id, 'moneyBag')).toThrowError(OverdrawError);
    });

    it("Test updating an account", async () => {
        savedAccount.accName = 'wineMoney';
        await accountServices.updateAccount(savedAccount);
        const checkAccount:Account = await accountServices.getAccount(client.id, savedAccount.accName);
        expect(checkAccount.accName).toBe('wineMoney');
    })

    // Deleting both test accounts to avoid altering database.
    it("Test deleting an account.", async () => {
        await accountServices.deleteAccount(client.id, savedAccount.accName);
        await accountServices.deleteAccount(client.id, savedAccount2.accName);
        try {
            await accountServices.getAccount(client.id, savedAccount.accName);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    })

});