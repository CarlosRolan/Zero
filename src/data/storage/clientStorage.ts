import { Client } from "../../types/client";
import { Exercise } from "../../types/exercise";
import { CLIENTS_KEY, EXERCISES_KEY } from "./local_keys";
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

export const saveClientLocal = async (newClient: Client): Promise<"ok" | "name" | "phone" | "both"> => {
 const validation = await validateClient(newClient);
 if (validation === "ok") {
  const oldClients = await getStorage(CLIENTS_KEY);
  const newClients = [...oldClients, newClient];
  await setStorage(CLIENTS_KEY, newClients);
 }
 return validation;
};

export const deleteClientLocal = async (idToDelete: number) => {
 try {
  /* ---------- CLIENTES ---------- */
  const oldClients: Client[] = await getStorage(CLIENTS_KEY);
  const newClients = oldClients.filter(c => c.id !== idToDelete);
  await setStorage(CLIENTS_KEY, newClients);

  /* ---------- EJERCICIOS ---------- */
  const allExercises: Exercise[] = await getStorage(EXERCISES_KEY);
  const remainingExercises = allExercises.filter(
   ex => ex.id_client !== idToDelete
  );
  await setStorage(EXERCISES_KEY, remainingExercises);

 } catch (err) {
  console.error("Error eliminando cliente:", err);
 }
};

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



export const validateClient = async (client: Client): Promise<"ok" | "name" | "phone" | "both"> => {
 const clients: Client[] = await getStorage(CLIENTS_KEY);

 const nameExists = clients.some((iter) => iter.name === client.name);
 const phoneExists = clients.some((iter) => iter.phone === client.phone);

 if (nameExists && phoneExists) return "both";
 if (nameExists) return "name";
 if (phoneExists) return "phone";
 return "ok";
};
