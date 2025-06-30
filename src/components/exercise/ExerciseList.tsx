import { IonList, IonItem, IonLabel } from "@ionic/react";
import { Exercise } from "../../types/exercise";

export const ExerciseList: React.FC<{ exercises: Exercise[] }> = ({ exercises }) => (
 <IonList className="exercise-list">
  {exercises.map((ex) => (
   <IonItem key={ex.id} lines="full" detail={false}>
    <IonLabel className="ion-text-wrap">
     <h3 className="exercise-title">{ex.name}</h3>
     <p>
      <strong>Peso:</strong> {ex.max_weight} kg&nbsp;&nbsp;•&nbsp;&nbsp;
      <strong>Reps:</strong> {ex.max_reps}
     </p>
    </IonLabel>
   </IonItem>
  ))}
 </IonList>
);