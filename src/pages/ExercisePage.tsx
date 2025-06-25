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
 const { id } = useParams<{ id: string }>();
 const [clientId, setClientId] = React.useState<number>(-1);


 useIonViewWillEnter(() => {
  console.log("ID PARAMETRO in page", id);
  if (id) {
   console.log("HAY PARAMETRO")
   const parsed = parseInt(id, 10);
   console.log("PARSED ID", parsed);
   setClientId(parsed);
  } 
 },[id]);

 return (
  <IonPage>
   <IonHeader>
    <IonToolbar>
     <IonTitle>Ejercicios</IonTitle>
    </IonToolbar>
   </IonHeader>
   <IonContent className="ion-padding">

    <ExerciseForm clientId={clientId} />
   </IonContent>
  </IonPage>
 );
};

export default ExercisePage;
