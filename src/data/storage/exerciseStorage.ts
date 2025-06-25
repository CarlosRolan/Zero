
import { Exercise } from "../../types/exercise";
import { EXERCISES_KEY } from "./local_keys";
import { getStorage, setStorage } from "./storage";

export const getExercisesLocal = async (): Promise<Exercise[]> => {
 try {
  const exercises: Exercise[] = await getStorage(EXERCISES_KEY);
  return exercises;
 } catch (error) {
  console.error("Error getting exercises:", error);
  return [];
 }
}

export const saveExerciseLocal = async (newExercise: Exercise) => {
 try {
  const isValid = await validateExercise(newExercise);
  const olds = await getStorage(EXERCISES_KEY);
  if (isValid) {
   const news = [...olds, newExercise];
   setStorage(EXERCISES_KEY, news);
   console.log("EJERCICIO añadido correctamente");
  } else {
   console.log("EJERCICIO no añadido");
  }
 } catch (error) {

 }
}

export const deleteExerciseLocal = async (toDelete: Exercise) => {
 try {
  const olds: Exercise[] = await getStorage(EXERCISES_KEY);
  const exists = olds.find(iter => iter.id === toDelete.id);
  if (exists) {
   const news: Exercise[] = [...olds.filter(iter => iter.id !== toDelete.id)]
   setStorage(EXERCISES_KEY, news);
   console.log("EJERCICIO eliminado correctamente");
  } else {
   console.log("No existe un EXERCISE con ese id para poder borrarlo");

  }
 } catch (error) {

 }
}

export const updateExerciseLocal = async (updated: Exercise) => {
 try {
  const olds: Exercise[] = await getStorage(EXERCISES_KEY);


  const news: Exercise[] = olds.map((c) => {
   if (c.id === updated.id) {
    return updated;
   } else {
    return c;
   }
  }
  );

  setStorage(EXERCISES_KEY, news)


 } catch (error) {

 }
}

export const validateExercise = async (client: Exercise): Promise<"ok" | "name" | "peso" | "reps"> => {
 const clients: Exercise[] = await getStorage(EXERCISES_KEY);

 const nameExists = clients.some((iter) => iter.name === client.name);

 if (client.max_weight <= 0) {
  console.error("El peso máximo debe ser mayor que 0");
  return "peso";
 }

 if (client.max_reps <= 0) {
  console.error("El número máximo de repeticiones debe ser mayor que 0");
  return "reps";
 }

 if (nameExists) return "name";

 return "ok";
};
