import { Client, Account, ID, Databases, Storage } from 'react-native-appwrite';

const client = new Client()
    .setProject('67ea65f4001036d9b64e')
    .setPlatform('com.pushpaje.art-veda');

    export const account = new Account(client);
    export const database = new Databases(client);
    export const storage = new Storage(client);
    export { ID };