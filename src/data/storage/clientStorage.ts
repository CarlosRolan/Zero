import { Client } from "../../types/client";
import { CLIENTS_KEY } from "./local_keys";
import { getStorage, setStorage } from "./storage";

export const getClientsLocal = async (): Promise<Client[]> => {
 try {
  const clients: Client[] = await getStorage(CLIENTS_KEY);
  return clients;
 } catch (error) {
  console.error("Error getting clients:", error);
  return [];
 }
}

export const saveClientLocal = async (newClient: Client) => {
 try {
  const isValid = await validateClient(newClient);
  const oldClients = await getStorage(CLIENTS_KEY);
  if (isValid) {
   const newClients = [...oldClients, newClient];
   setStorage(CLIENTS_KEY, newClients);
  } else {
   console.log("Cliente no añadido");
  }
 } catch (error) {

 }
}

export const deleteCientLocal = async (toDelete: Client) => {
 try {
  const oldClients: Client[] = await getStorage(CLIENTS_KEY);
  const exists = oldClients.find(iter => iter.id === toDelete.id);
  if (exists) {
   const newClients: Client[] = [...oldClients.filter(iter => iter.id !== toDelete.id)]
   setStorage(CLIENTS_KEY, newClients);
  } else {
   console.log("No existe un usuario con ese id para poder borrarlo");

  }
 } catch (error) {

 }
}

export const updateClientLocal = async (updatedClient: Client) => {
 try {
  const oldClients: Client[] = await getStorage(CLIENTS_KEY);


  const newClients: Client[] = oldClients.map((c) => {
   if (c.id === updatedClient.id) {
    return updatedClient;
   } else {
    return c;
   }
  }
  );

  setStorage(CLIENTS_KEY, newClients)


 } catch (error) {

 }
}



const validateClient = async (client: Client): Promise<boolean> => {
 const clients: Client[] = await getStorage(CLIENTS_KEY);

 const nameExists = clients.some((iter) => iter.name === client.name);
 if (nameExists) {
  console.log("cliente con el mismo NOMBRE");
  return false;
 }

 const phoneExists = clients.some((iter) => iter.phone === client.phone);
 if (phoneExists) {
  console.log("cliente con el mismo TELEFONO");
  return false;
 }

 return true;
};
