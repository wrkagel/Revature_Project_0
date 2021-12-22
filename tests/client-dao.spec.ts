import ClientDAO, {ClientDao} from "../daos/client-dao";
import Client from '../entities/client'
import NotFoundError from "../errors/notFoundError";

describe("Test suite for client-dao.ts", () => {

    const clientDao:ClientDAO = new ClientDao();
    let savedClient:Client = null;
    let savedClient2:Client = null;

    it("Test client creation.", async () => {
        savedClient = await clientDao.createClient({fname:"Harvey", lname:"Joe Steve", id:"", accounts: []});
        expect(savedClient.id).not.toBeFalsy();
        // Make second client for getAllClients test.
        savedClient2 = await clientDao.createClient({fname:"Steve", lname:"Harvey Joe", id:"", accounts: []});
    });

    it("Test getting all clients.", async () => {
        const arr:Client[] = await clientDao.getAllClients();
        expect(arr).toContainEqual(savedClient);
        expect(arr).toContainEqual(savedClient2);
    });

    it("Test getting a client by id.", async () => {
        expect(await clientDao.getClient(savedClient.id)).toEqual(savedClient);
    });

    it("Test getClient throws NotFoundError.", async () => {
        try {
            await clientDao.getClient('_');
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("Test update a client.", async () => {
        savedClient.lname = "Harvey Harvey III";
        const returnedClient:Client = await clientDao.updateClient(savedClient.id, savedClient);
        expect(returnedClient.lname).toBe("Harvey Harvey III");
    });

    it("Test delete a client.", async () => {
        await clientDao.deleteClient(savedClient.id);
        //Delete other client to maintain database
        await clientDao.deleteClient(savedClient2.id);
        try {
            await clientDao.getClient(savedClient.id);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

});