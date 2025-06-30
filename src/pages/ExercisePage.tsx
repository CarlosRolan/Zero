import {
 IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from "@ionic/react";
import React from "react";
import ExerciseForm from "../components/exercise/ExerciseForm";

const ExercisePage: React.FC = () => {

 return (
  <IonPage>
   <IonHeader>
    <IonToolbar>
     <IonTitle>Ejercicios</IonTitle>
    </IonToolbar>
   </IonHeader>
   <IonContent className="ion-padding">
    <ExerciseForm />
   </IonContent>
  </IonPage>
 );
};

export default ExercisePage;
