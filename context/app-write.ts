import { Client, Account, ID, Databases, Storage } from "react-native-appwrite";

const client = new Client()
  .setProject("6815dda60027ce5089d8")
  .setPlatform("com.artveda");

export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export { ID };
