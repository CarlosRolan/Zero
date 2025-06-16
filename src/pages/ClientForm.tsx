import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem,
  IonLabel, IonButton, IonList, IonToast, IonIcon
} from "@ionic/react";
import { trashOutline, pencilOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getClients, saveClients } from "../data/storage";
import { Client } from "../types/client";
import { InputCustomEvent } from "@ionic/react";

type Exercise = {
  name: string;
  weight: number;
  reps: number;
};

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();

  const [clientReady, setClientReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showToast, setShowToast] = useState(false);

  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseWeight, setExerciseWeight] = useState(0);
  const [exerciseReps, setExerciseReps] = useState(0);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      getClients().then(clients => {
        const client = clients.find(c => c.id.toString() === id);
        if (client) {
          setName(client.name);
          setPhone(client.phone);
          setExercises(client.exercises);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    const validName = !!name?.trim();
    const validPhone = !!phone?.trim();
    const hasExercises = exercises.length > 0;

    setClientReady(validName && validPhone && hasExercises);
  }, [name, phone, exercises]);


  const startAddExercise = () => {
    setExerciseName("");
    setExerciseWeight(0);
    setExerciseReps(0);
    setEditingExerciseIndex(null);
    setShowExerciseForm(true);
  };

  const saveExercise = () => {
    const newExercise: Exercise = {
      name: exerciseName,
      weight: exerciseWeight,
      reps: exerciseReps
    };

    let updatedExercises;
    if (editingExerciseIndex !== null) {
      updatedExercises = [...exercises];
      updatedExercises[editingExerciseIndex] = newExercise;
    } else {
      updatedExercises = [...exercises, newExercise];
    }

    setExercises(updatedExercises);
    setShowExerciseForm(false);
    setEditingExerciseIndex(null);
  };

  const editExercise = (index: number) => {
    const ex = exercises[index];
    setExerciseName(ex.name);
    setExerciseWeight(ex.weight);
    setExerciseReps(ex.reps);
    setEditingExerciseIndex(index);
    setShowExerciseForm(true);
  };

  const deleteExercise = (index: number) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const saveClient = async () => {
    const clients = await getClients();
    let updatedClients;

    if (id) {
      updatedClients = clients.map(c =>
        c.id.toString() === id
          ? { ...c, name, phone, exercises }
          : c
      );
    } else {
      const newClient: Client = {
        id: Date.now(),
        name,
        phone,
        exercises,
      };
      updatedClients = [...clients, newClient];
    }

    await saveClients(updatedClients);
    setShowToast(true);
    setTimeout(() => history.push("/clients"), 1000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{id ? "Editar Cliente" : "Nuevo Cliente"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Nombre</IonLabel>
          <IonInput value={name} onIonChange={e => setName(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Teléfono</IonLabel>
          <IonInput value={phone} onIonChange={e => setPhone(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" onClick={startAddExercise} disabled={showExerciseForm}>
          {editingExerciseIndex !== null ? "Editar Ejercicio" : "Añadir Ejercicio"}
        </IonButton>

        {showExerciseForm && (
          <>
            <IonItem>
              <IonLabel position="stacked">Ejercicio</IonLabel>
              <IonInput value={exerciseName} onIonChange={e => setExerciseName(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Peso (kg)</IonLabel>
              <IonInput type="number" value={exerciseWeight} onIonChange={e => setExerciseWeight(parseInt(e.detail.value!, 10))} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Repeticiones</IonLabel>
              <IonInput type="number" value={exerciseReps} onIonChange={e => setExerciseReps(parseInt(e.detail.value!, 10))} />
            </IonItem>
            <IonButton expand="block" color="success" onClick={saveExercise}>Confirmar Ejercicio</IonButton>
          </>
        )}

        <IonList>
          {exercises.map((ex, index) => (
            <IonItem key={index}>
              <IonLabel>
                <strong>{ex.name}</strong> — {ex.weight} kg x {ex.reps} reps
              </IonLabel>
              <IonButton fill="clear" slot="end" onClick={() => editExercise(index)}>
                <IonIcon icon={pencilOutline} />
              </IonButton>
              <IonButton fill="clear" slot="end" color="danger" onClick={() => deleteExercise(index)}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonItem>
          <IonLabel>Total ejercicios: {exercises.length}</IonLabel>
        </IonItem>

        <IonButton expand="block" color="primary" onClick={saveClient} disabled={!clientReady}>
          {id ? "Guardar Cambios" : "Crear Cliente"}
        </IonButton>

        <IonToast isOpen={showToast} message="Cliente guardado correctamente" duration={2000} onDidDismiss={() => setShowToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default ClientForm;
