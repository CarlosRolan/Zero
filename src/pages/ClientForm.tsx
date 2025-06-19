import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem,
  IonLabel, IonButton, IonList, IonToast, IonIcon,
  useIonViewWillEnter
} from "@ionic/react";
import { trashOutline, pencilOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Client } from "../types/client";
import { InputCustomEvent } from "@ionic/react";
import { Exercise } from "../types/exercise";
import { getClientsLocal, saveClientLocal, updateClientLocal } from "../data/storage/clientStorage";
import { deleteExerciseLocal, getExercisesLocal, saveExerciseLocal, updateExerciseLocal } from "../data/storage/exerciseStorage";

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
  const [exerciseId, setExerciseId] = useState<number>(-1);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [formLoaded, setFormLoaded] = useState(false);

  useIonViewWillEnter(() => {
    const initForm = async () => {
      setFormLoaded(false); // Bloquea render al principio

      if (id) {
        await loadClient();
        await loadExercisesByClientId(parseInt(id, 10));
      } else {
        setName("");
        setPhone("");
        setExercises([]);
        clearExerciseForm();
      }

      setFormLoaded(true); // Solo activa render cuando todo esté listo
    };

    initForm(); // Llamada a la función async
  });




  const loadClient = async () => {
    const data = await getClientsLocal();
    const client = data.find(c => c.id.toString() === id);
    if (client) {
      setName(client.name);
      setPhone(client.phone);
    }
  };


  const loadExercisesByClientId = async (clientId: number) => {
    const allExercises = await getExercisesLocal();
    setExercises(allExercises.filter(ex => ex.id_client === clientId));
  }


  useEffect(() => {
    const validName = !!name?.trim();
    const validPhone = !!phone?.trim();

    setClientReady(validName && validPhone);
  }, [name, phone, exercises]);


  const startAddExercise = () => {
    setExerciseName("");
    setExerciseWeight(0);
    setExerciseReps(0);
    setEditingExerciseIndex(null);
    setShowExerciseForm(true);
  };

  const clearExerciseForm = () => {
    setExerciseName("");
    setExerciseWeight(0);
    setExerciseReps(0);
    setEditingExerciseIndex(null);
    setExerciseId(-1);
    setShowExerciseForm(false);
  }


  const submitExercise = async () => {

    const exercise: Exercise = {
      id: exerciseId ? exerciseId : Date.now(), // Generate a new ID for new exercises
      name: exerciseName,
      max_weight: exerciseWeight,
      max_reps: exerciseReps,
      id_client: id ? parseInt(id, 10) : 0 // Use 0 if no client ID
    };

    if (exerciseId !== -1) {
      // If editing an existing exercise, update it
      exercise.id = exerciseId;
      await updateExerciseLocal(exercise);
    } else {
      // If creating a new exercise, generate a new ID
      exercise.id = Date.now();
      await saveExerciseLocal(exercise);
    }


    setExercises(prev => {
      const updated = [...prev];
      if (editingExerciseIndex !== null) {
        updated[editingExerciseIndex] = exercise; // Update existing exercise
      } else {
        updated.push(exercise); // Add new exercise
      }
      return updated;
    }
    );

    clearExerciseForm();
  };


  const editExercise = (index: number) => {
    const ex = exercises[index];
    setExerciseName(ex.name);
    setExerciseWeight(ex.max_weight);
    setExerciseReps(ex.max_reps);
    setExerciseId(ex.id);
    setEditingExerciseIndex(index);
    setShowExerciseForm(true);
  };

  const deleteExercise = async (index: number) => {
    const exerciseToDelete = exercises[index];

    await deleteExerciseLocal(exerciseToDelete);
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const submitClient = async () => {
    if (id) {
      await updateClientLocal({
        id: parseInt(id, 10),
        name,
        phone
      });
    } else {
      await saveClientLocal({
        id: Date.now(), // Generate a new ID for new clients
        name,
        phone
      }
      );
    }
    setShowToast(true);
    setTimeout(() => history.push("/clients"), 1000);
  };

  if (!formLoaded) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <p>Cargando...</p>
        </IonContent>
      </IonPage>
    );
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{id ? "Editando Cliente" : "Creando nuevo Cliente"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Nombre</IonLabel>
          <IonInput
            value={name}
            onIonInput={(e) => setName(e.detail.value!)}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Teléfono</IonLabel>
          <IonInput
            value={phone}
            onIonInput={(e) => setPhone(e.detail.value!)}
          />
        </IonItem>

        {id && (<IonButton expand="block" onClick={startAddExercise} disabled={showExerciseForm}>
          {editingExerciseIndex !== null ? "Editar Ejercicio" : "Añadir Ejercicio"}
        </IonButton>)}


        {showExerciseForm && (
          <>
            <IonItem>
              <IonLabel position="stacked">Ejercicio</IonLabel>
              <IonInput
                value={exerciseName}
                onIonInput={(e) => setExerciseName(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Peso (kg)</IonLabel>
              <IonInput
                type="number"
                value={exerciseWeight}
                onIonInput={(e) => setExerciseWeight(parseInt(e.detail.value!))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Repeticiones</IonLabel>
              <IonInput
                type="number"
                value={exerciseReps}
                onIonInput={(e) => setExerciseReps(parseInt(e.detail.value!))}
              />
            </IonItem>
            <IonButton expand="block" color={exerciseId === -1 ? "success" : "warning"} onClick={submitExercise}>{exerciseId === -1 ? "Guardar ejercicio" : "Actualizar"}</IonButton>
            <IonButton expand="block" color="danger" onClick={clearExerciseForm}>
              Descartar
            </IonButton>
          </>
        )}

        <IonList>
          {exercises.map((ex, index) => (
            <IonItem key={index}>
              <IonLabel>
                <strong>{ex.name}</strong> — {ex.max_weight} kg x {ex.max_reps} reps
              </IonLabel>
              <IonButton fill="clear" slot="end" color="warning" onClick={() => editExercise(index)}>
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

        <IonButton expand="block" color={id ? "warning" : "primary"} onClick={submitClient} disabled={!clientReady}>
          {id ? "Guardar Cambios" : "Crear Cliente"}
        </IonButton>

        <IonToast isOpen={showToast} message="Cliente guardado correctamente" duration={2000} onDidDismiss={() => setShowToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default ClientForm;
