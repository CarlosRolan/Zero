// src/pages/ExerciseForm.tsx
import {
 IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem,
 IonLabel, IonInput, IonButton, IonToast, IonSelect, IonSelectOption,
 IonList, IonIcon
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Client } from "../types/client";
import { Exercise } from "../types/exercise";
import { getClientsLocal } from "../data/storage/clientStorage";
import { saveExerciseLocal } from "../data/storage/exerciseStorage";

const ExerciseForm: React.FC = () => {
 const history = useHistory();

 const [exerciseName, setExerciseName] = useState("");
 const [maxWeight, setMaxWeight] = useState<number>(0);
 const [maxReps, setMaxReps] = useState<number>(0);

 const [allClients, setAllClients] = useState<Client[]>([]);
 const [selectedClients, setSelectedClients] = useState<Client[]>([]);
 const [showToast, setShowToast] = useState(false);

 useEffect(() => {
  getClientsLocal().then(setAllClients);
 }, []);

 const handleSelectClient = (clientId: number) => {
  const client = allClients.find(c => c.id === clientId);
  if (client && !selectedClients.find(c => c.id === client.id)) {
   setSelectedClients([...selectedClients, client]);
  }
 };

 const removeClient = (id: number) => {
  setSelectedClients(selectedClients.filter(c => c.id !== id));
 };

 const submitExercise = async () => {
  for (const client of selectedClients) {
   const newExercise: Exercise = {
    id: Date.now() + client.id,
    name: exerciseName,
    max_weight: maxWeight,
    max_reps: maxReps,
    id_client: client.id,
   };
   await saveExerciseLocal(newExercise);
  }

  setShowToast(true);
  setTimeout(() => history.push("/exercises"), 1000);
 };

 return (
  <IonPage>
   <IonHeader>
    <IonToolbar>
     <IonTitle>Nuevo Ejercicio</IonTitle>
    </IonToolbar>
   </IonHeader>
   <IonContent className="ion-padding">
    <IonItem>
     <IonLabel position="stacked">Nombre del ejercicio</IonLabel>
     <IonInput value={exerciseName} onIonChange={e => setExerciseName(e.detail.value!)} />
    </IonItem>
    <IonItem>
     <IonLabel position="stacked">Peso máximo (kg)</IonLabel>
     <IonInput type="number" value={maxWeight} onIonChange={e => setMaxWeight(parseInt(e.detail.value!, 10))} />
    </IonItem>
    <IonItem>
     <IonLabel position="stacked">Repeticiones máximas</IonLabel>
     <IonInput type="number" value={maxReps} onIonChange={e => setMaxReps(parseInt(e.detail.value!, 10))} />
    </IonItem>

    <IonItem>
     <IonLabel position="stacked">Asignar a clientes</IonLabel>
     <IonSelect placeholder="Selecciona cliente" onIonChange={e => handleSelectClient(e.detail.value)}>
      {allClients
       .filter(c => !selectedClients.some(sel => sel.id === c.id))
       .map(c => (
        <IonSelectOption key={c.id} value={c.id}>
         {c.name} - {c.phone}
        </IonSelectOption>
       ))}
     </IonSelect>
    </IonItem>

    <IonList>
     {selectedClients.map(c => (
      <IonItem key={c.id}>
       <IonLabel>{c.name} - {c.phone}</IonLabel>
       <IonButton slot="end" color="danger" onClick={() => removeClient(c.id)}>
        <IonIcon icon={trashOutline} />
       </IonButton>
      </IonItem>
     ))}
    </IonList>

    <IonButton expand="block" color="primary" onClick={submitExercise} disabled={selectedClients.length === 0 || !exerciseName}>
     Guardar Ejercicio
    </IonButton>

    <IonToast isOpen={showToast} message="Ejercicio guardado correctamente" duration={2000} onDidDismiss={() => setShowToast(false)} />
   </IonContent>
  </IonPage>
 );
};

export default ExerciseForm;
