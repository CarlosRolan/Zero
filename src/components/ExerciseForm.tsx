import {
  IonItem, IonLabel, IonInput, IonButton, IonList, IonToast, IonIcon, IonSelect, IonSelectOption,
  useIonViewWillEnter
} from "@ionic/react";
import { trashOutline, pencilOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { Exercise } from "../types/exercise";
import { Client } from "../types/client";
import {
  deleteExerciseLocal,
  getExercisesLocal,
  saveExerciseLocal,
  updateExerciseLocal,
  validateExercise
} from "../data/storage/exerciseStorage";
import { getClientsLocal } from "../data/storage/clientStorage";
import { useHistory } from "react-router";

interface ExerciseFormProps {
  clientId: number;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ clientId: initialClientId }) => {
  const inputRef = useRef<HTMLIonInputElement>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseWeight, setExerciseWeight] = useState(0);
  const [exerciseReps, setExerciseReps] = useState(0);
  const [exerciseId, setExerciseId] = useState<number>(-1);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [nameError, setNameError] = useState(false);

  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(initialClientId);

  const [noClients, setNoClients] = useState(false);

  const history = useHistory();

  useIonViewWillEnter(() => {
    const loadClients = async () => {
      const clients = await getClientsLocal();
      if (clients.length === 0) {
        setNoClients(true);
      } else {
        setNoClients(false);
      }
      setAvailableClients(clients);
    };

    loadClients();
    setClientId(initialClientId);
    if (initialClientId !== -1 && initialClientId !== -2) {
      loadExercisesByClientId(initialClientId);
    } else {
      setExercises([]);
    }
  });

  useEffect(() => {
    setClientId(initialClientId);
    if (initialClientId !== -1 && initialClientId !== -2) {
      loadExercisesByClientId(initialClientId);
    } else {
      setExercises([]);
    }
  }, [initialClientId]);

  const loadExercisesByClientId = async (clientId: number) => {
    const allExercises = await getExercisesLocal();
    setExercises(allExercises.filter(ex => ex.id_client === clientId));
  };

  const clearExerciseForm = () => {
    setExerciseName("");
    setExerciseWeight(0);
    setExerciseReps(0);
    setEditingExerciseIndex(null);
    setExerciseId(-1);
    setNameError(false);
  };

  const submitExercise = async () => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName) {
      setNameError(true);
      inputRef.current?.setFocus();
      return;
    }

    const exercise: Exercise = {
      id: exerciseId !== -1 ? exerciseId : Date.now(),
      name: trimmedName,
      max_weight: exerciseWeight,
      max_reps: exerciseReps,
      id_client: clientId
    };

    const validation = await validateExercise(exercise);

    if (validation === "name") {
      setNameError(true);
      inputRef.current?.setFocus();
      return;
    }

    if (exerciseId !== -1) {
      await updateExerciseLocal(exercise);
      setToastMsg("Ejercicio actualizado correctamente");
    } else {
      await saveExerciseLocal(exercise);
      setToastMsg("Ejercicio guardado correctamente");
    }

    setExercises(prev => {
      const updated = [...prev];
      if (editingExerciseIndex !== null) {
        updated[editingExerciseIndex] = exercise;
      } else {
        updated.push(exercise);
      }
      return updated;
    });

    setShowToast(true);
    clearExerciseForm();
  };

  const editExercise = (index: number) => {
    const ex = exercises[index];
    setExerciseName(ex.name);
    setExerciseWeight(ex.max_weight);
    setExerciseReps(ex.max_reps);
    setExerciseId(ex.id);
    setEditingExerciseIndex(index);
    setNameError(false);
  };

  const deleteExercise = async (index: number) => {
    const exerciseToDelete = exercises[index];
    await deleteExerciseLocal(exerciseToDelete);

    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);

    setToastMsg("Ejercicio eliminado correctamente");
    setShowToast(true);
  };

  const handleClientChange = (value: number) => {
    setClientId(value);
    clearExerciseForm();

    if (value !== 0) {
      loadExercisesByClientId(value);
    } else {
      setExercises([]);
    }
  };

  return (
    <>
      {noClients ? (
        <>
          <IonLabel position="stacked">No hay clientes creados aún, por favor crea uno antes de añadir ejercicios</IonLabel>
          <IonButton expand="block" color="primary" onClick={() => history.push("/client-form/")}>
            Crear cliente
          </IonButton>
        </>
      ) : clientId === -1 ? (
        <IonItem>
          <IonLabel position="stacked">Selecciona cliente</IonLabel>
          <IonSelect
            value={0}
            placeholder="Selecciona un cliente"
            onIonChange={(e) => handleClientChange(e.detail.value)}
          >
            {availableClients.map(client => (
              <IonSelectOption key={client.id} value={client.id}>
                {client.name} - {client.phone}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      ) : (
        <>
          <IonItem color={nameError ? "danger" : undefined}>
            <IonLabel position="stacked">Ejercicio</IonLabel>
            <IonInput
              ref={inputRef}
              value={exerciseName}
              onIonInput={(e) => {
                setExerciseName(e.detail.value!);
                setNameError(false);
              }}
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

          <IonItem lines="full">
            <IonLabel>
              <strong>Ejercicios del cliente:</strong>
            </IonLabel>
          </IonItem>

          <IonList lines="none">
            {exercises.map((ex, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <strong>{ex.name}</strong> — {ex.max_weight} kg × {ex.max_reps} reps
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="warning"
                  onClick={() => editExercise(index)}
                >
                  <IonIcon icon={pencilOutline} />
                </IonButton>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="danger"
                  onClick={() => deleteExercise(index)}
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>

          <IonButton
            expand="block"
            color={exerciseId === -1 ? "success" : "warning"}
            onClick={submitExercise}
          >
            {exerciseId === -1 ? "Guardar ejercicio" : "Actualizar"}
          </IonButton>
          <IonButton expand="block" color="medium" onClick={clearExerciseForm}>
            Cancelar
          </IonButton>

          <IonToast
            isOpen={showToast}
            message={toastMsg}
            duration={1500}
            onDidDismiss={() => setShowToast(false)}
          />
        </>
      )}
    </>
  );
};

export default ExerciseForm;
