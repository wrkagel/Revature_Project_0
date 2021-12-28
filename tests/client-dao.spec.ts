import ClientDAO, {ClientDao} from "../daos/client-dao";
import Client from '../entities/client'
import NotFoundError from "../errors/notFoundError";

describe("Test suite for client-dao.ts", () => {

    const clientDao:ClientDAO = new ClientDao();
    let savedClient:Client = null;
    let savedClient2:Client = null;

    // Only uncomment and run below test on an empty server and when testing the client-dao.spec.ts alone.
    // DO NOT RUN when running other test files!
    // it("Test getting all clients.", async () => {
    //     const arr:Client[] = await clientDao.getAllClients();
    //     expect(arr).toHaveLength(0);
    // });

    it("should create a client.", async () => {
        savedClient = await clientDao.createClient({fname:"Harvey", lname:"Joe Steve", id:"", accounts: []});
        expect(savedClient.id).not.toBeFalsy();
        // Make second client for getAllClients test.
        savedClient2 = await clientDao.createClient({fname:"Steve", lname:"Harvey Joe", id:"", accounts: []});
    });

    it("should return all clients.", async () => {
        const arr:Client[] = await clientDao.getAllClients();
        expect(arr).toContainEqual(savedClient);
        expect(arr).toContainEqual(savedClient2);
    });

    it("should return a client based on the id of the saved client.", async () => {
        expect(await clientDao.getClient(savedClient.id)).toEqual(savedClient);
    });

    it("should throw a NotFoundError.", async () => {
        try {
            await clientDao.getClient('_');
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });

    it("should update the client.", async () => {
        savedClient.lname = "Harvey Harvey III";
        const returnedClient:Client = await clientDao.updateClient(savedClient.id, savedClient);
        expect(returnedClient.lname).toBe("Harvey Harvey III");
    });

    it("should delete the client.", async () => {
        const result = await clientDao.deleteClient(savedClient.id);
        //Delete other client to maintain database
        await clientDao.deleteClient(savedClient2.id);
        expect(result).toBe(true);
        try {
            await clientDao.getClient(savedClient.id);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundError);
        }
    });
});