import { IonGrid, IonRow, IonCol } from "@ionic/react";
import { Exercise } from "../../types/exercise";

export const ExerciseTable: React.FC<{ exercises: Exercise[] }> = ({ exercises }) => (
 <IonGrid className="table-bordered exercises-subtable">
  <IonRow className="header-row exercises-header">
   <IonCol>Ejercicio</IonCol>
   <IonCol>Peso (kg)</IonCol>
   <IonCol>Reps</IonCol>
  </IonRow>
  {exercises.map((ex) => (
   <IonRow key={ex.id}>
    <IonCol>{ex.name}</IonCol>
    <IonCol>{ex.max_weight}</IonCol>
    <IonCol>{ex.max_reps}</IonCol>
   </IonRow>
  ))}
 </IonGrid>
);