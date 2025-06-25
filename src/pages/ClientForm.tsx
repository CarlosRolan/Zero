import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem,
  IonLabel, IonButton, IonToast,
  useIonViewWillEnter
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Client } from "../types/client";
import { Exercise } from "../types/exercise";
import { deleteClientLocal, getClientsLocal, saveClientLocal, updateClientLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
import ExerciseForm from "../components/ExerciseForm";

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [clientId, setClientId] = useState(-1);
  const history = useHistory();

  const nameInputRef = useRef<HTMLIonInputElement>(null);
  const phoneInputRef = useRef<HTMLIonInputElement>(null);

  const [validationError, setValidationError] = useState<"" | "name" | "phone" | "both">("");
  const [clientReady, setClientReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Cliente guardado correctamente");

  const [formLoaded, setFormLoaded] = useState(false);

  useIonViewWillEnter(() => {
    const initForm = async () => {
      setFormLoaded(false); // Bloquea render al principio

      if (id) {
        await loadClient();
        setClientId(parseInt(id, 10));
      } else {
        setName("");
        setPhone("");
      }

      setFormLoaded(true); // Solo activa render cuando todo esté listo
    };

    initForm(); // Llamada a la función async
  });

  useEffect(() => {
    if (id) {
      setClientId(parseInt(id, 10));
      setToastMsg("Cliente actualizado correctamente");
    } else {
      setClientId(-1);
    }
  }, [id]);

  useEffect(() => {
    const validName = !!name?.trim();
    const validPhone = !!phone?.trim();

    setClientReady(validName && validPhone);
  }, [name, phone]);


  const loadClient = async () => {
    const data = await getClientsLocal();
    const client = data.find(c => c.id.toString() === id);
    if (client) {
      setName(client.name);
      setPhone(client.phone);
    }
  };

  const deleteClientById = async (clientId: number) => {
    setToastMsg("Cliente eliminado correctamente");
    await deleteClientLocal(clientId);
    history.push("/clients")
  }



  const submitClient = async () => {
    const newClient: Client = {
      id: id ? parseInt(id, 10) : Date.now(),
      name,
      phone,
    };

    if (id) {
      await updateClientLocal(newClient);
      setShowToast(true);
      history.push("/clients");
    } else {
      const validation = await saveClientLocal(newClient);

      if (validation !== "ok") {
        setValidationError(validation);

        if (validation === "name" || validation === "both") {
          nameInputRef.current?.setFocus();
        } else if (validation === "phone") {
          phoneInputRef.current?.setFocus();
        }

        return;
      }

      setShowToast(true);
      history.push("/clients");
    }
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

        {validationError && (
          <IonItem color="danger">
            <IonLabel className="ion-text-wrap">
              {validationError === "both" && "El nombre y el teléfono ya existen"}
              {validationError === "name" && "El nombre ya existe"}
              {validationError === "phone" && "El teléfono ya existe"}
            </IonLabel>
          </IonItem>
        )}


        <IonButton
          expand="block"
          color={id ? "warning" : "primary"}
          onClick={submitClient}
          disabled={!clientReady}

        >
          {id ? "Guardar Cambios Cliente" : "Crear Cliente"}
        </IonButton>

        {id && clientId != -1 && (
          <>
            <IonButton
              expand="block"
              color={"danger"}
              onClick={deleteClientById.bind(null, clientId)}
              disabled={!clientReady}
            >
              Eliminar
            </IonButton>

            <IonButton
              expand="block"
              color={"success"}
              onClick={() => history.push(`/exercise-form/${clientId}`)}
              disabled={!clientReady}
            >
              Añadir ejercicios
            </IonButton>

          </>
        )}


        <IonToast isOpen={showToast} message={toastMsg} duration={2000} onDidDismiss={() => setShowToast(false)} />
      </IonContent>
    </IonPage>
  );
};

export default ClientForm;
