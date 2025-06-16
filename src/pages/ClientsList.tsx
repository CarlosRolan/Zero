import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonGrid, IonRow, IonCol, IonAlert, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonIcon
} from "@ionic/react";
import { pencilOutline, trashOutline } from "ionicons/icons";
import React, { useState } from "react";
import { Client } from "../types/client";
import { getClients, saveClients } from "../data/storage";
import { useHistory } from "react-router-dom";
import { useIonViewWillEnter } from "@ionic/react";
import "./ClientsList.css"; // Asegúrate de crear este CSS

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const history = useHistory();

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useIonViewWillEnter(() => {
    loadClients();
  });

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setShowAlert(true);
  };

  const deleteClient = async () => {
    if (!clientToDelete) return;
    const updated = clients.filter(c => c.id !== clientToDelete.id);
    await saveClients(updated);
    setClients(updated);
    setShowAlert(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clientes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {clients.map(client => (
          <IonCard key={client.id}>
            <IonCardHeader>
              <IonCardTitle>{client.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {/* Tabla de datos del cliente */}
              <IonGrid className="table-bordered">
                <IonRow className="header-row">
                  <IonCol>Nombre</IonCol>
                  <IonCol>Teléfono</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>{client.name}</IonCol>
                  <IonCol>{client.phone}</IonCol>
                </IonRow>
              </IonGrid>

              {/* Tabla de ejercicios */}
              <IonGrid className="table-bordered ion-margin-top">
                <IonRow className="header-row">
                  <IonCol>Ejercicio</IonCol>
                  <IonCol>Peso (kg)</IonCol>
                  <IonCol>Reps</IonCol>
                </IonRow>
                {client.exercises.map((ex, i) => (
                  <IonRow key={i}>
                    <IonCol>{ex.name}</IonCol>
                    <IonCol>{ex.weight}</IonCol>
                    <IonCol>{ex.reps}</IonCol>
                  </IonRow>
                ))}
              </IonGrid>

              {/* Botones de acción */}
              <IonGrid className="ion-margin-top">
                <IonRow>
                  <IonCol size="6">
                    <IonButton
                      size="small"
                      expand="block"
                      color="warning"
                      onClick={() => history.push(`/client-form/${client.id}`)}
                    >
                      <IonIcon icon={pencilOutline} slot="start" />
                      Editar
                    </IonButton>
                  </IonCol>
                  <IonCol size="6">
                    <IonButton
                      size="small"
                      expand="block"
                      color="danger"
                      onClick={() => confirmDelete(client)}
                    >
                      <IonIcon icon={trashOutline} slot="start" />
                      Eliminar
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ))}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Eliminar Cliente"
          message={`¿Seguro que quieres eliminar a ${clientToDelete?.name}?`}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Eliminar", role: "destructive", handler: deleteClient },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ClientsList;
