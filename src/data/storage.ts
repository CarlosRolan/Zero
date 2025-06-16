import { Preferences } from "@capacitor/preferences";
import { Client } from "../types/client";

const CLIENTS_KEY = "clients";

export const saveClients = async (clients: Client[]) => {
  await Preferences.set({
    key: CLIENTS_KEY,
    value: JSON.stringify(clients),
  });
};

export const getClients = async (): Promise<Client[]> => {
  const { value } = await Preferences.get({ key: CLIENTS_KEY });
  return value ? JSON.parse(value) : [];
};
