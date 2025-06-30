// ExercisePage.tsx
import {
 IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
 IonSelect,
 useIonViewWillEnter
} from "@ionic/react";
import { useParams } from "react-router-dom";
import React, { useEffect } from "react";
import ExerciseForm from "../components/ExerciseForm";
import { getClientsLocal } from "../data/storage/clientStorage";

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
