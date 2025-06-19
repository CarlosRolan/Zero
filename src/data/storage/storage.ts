import { Preferences } from "@capacitor/preferences";

export const getStorage = async <T>(key: string): Promise<T[]> => {
  const { value } = await Preferences.get({ key });
  try {
    return value ? JSON.parse(value) : [];
  } catch (err) {
    console.error("Error parsing storage data:", err);
    return [];
  }
};

export const setStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Error saving storage data:", err);
  }
};




