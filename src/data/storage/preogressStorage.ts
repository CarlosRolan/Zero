import { Progress } from "../../types/progress";
import { PROGRESS_KEY } from "./local_keys";
import { getStorage, setStorage } from "./storage";

export const getProgressLocal = async (): Promise<Progress[]> => {
 try {
  const progress: Progress[] = await getStorage(PROGRESS_KEY);
  return progress;
 } catch (error) {
  console.error("Error getting progress:", error);
  return [];
 }
};

export const saveProgressLocal = async (newProgress: Progress) => {
 try {
  const isValid = await validateProgress(newProgress);
  const olds = await getStorage(PROGRESS_KEY);
  if (isValid) {
   const news = [...olds, newProgress];
   await setStorage(PROGRESS_KEY, news);
  } else {
   console.log("PROGRESS no añadido");
  }
 } catch (error) {
  console.error("Error saving progress:", error);
 }
};

export const deleteProgressLocal = async (toDelete: Progress) => {
 try {
  const olds: Progress[] = await getStorage(PROGRESS_KEY);
  const exists = olds.find(iter => iter.id === toDelete.id);
  if (exists) {
   const news: Progress[] = olds.filter(iter => iter.id !== toDelete.id);
   await setStorage(PROGRESS_KEY, news);
  } else {
   console.log("No existe un PROGRESS con ese id para poder borrarlo");
  }
 } catch (error) {
  console.error("Error deleting progress:", error);
 }
};

export const updateProgressLocal = async (updated: Progress) => {
 try {
  const olds: Progress[] = await getStorage(PROGRESS_KEY);
  const news: Progress[] = olds.map((p) =>
   p.id === updated.id ? updated : p
  );
  await setStorage(PROGRESS_KEY, news);
 } catch (error) {
  console.error("Error updating progress:", error);
 }
};

const validateProgress = async (toValidate: Progress) => {
 const data: Progress[] = await getStorage(PROGRESS_KEY);

 // Evita duplicados con mismo mes en el mismo ejercicio
 const duplicate = data.find(
  (iter) =>
   iter.month === toValidate.month &&
   iter.id_exercise === toValidate.id_exercise &&
   iter.id !== toValidate.id
 );

 if (duplicate) {
  console.log("Ya existe un mes con ese nombre para ese ejercicio.");
  return false;
 }

 return true;
};
