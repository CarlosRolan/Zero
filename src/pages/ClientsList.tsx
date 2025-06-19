import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonIcon, IonAlert, IonCard, IonCardHeader, IonCardContent,
  useIonViewWillEnter,
  IonText,
  IonInput,
  IonSearchbar
} from "@ionic/react";
import { pencilOutline, trashOutline, chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { Client } from "../types/client";

import { useHistory } from "react-router-dom";
import "./ClientsList.css";
import { deleteCientLocal, getClientsLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
import { Exercise } from "../types/exercise";

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [clientExercises, setClientExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  const history = useHistory();

  useIonViewWillEnter(() => {
    loadClients();
  });

  useEffect(() => {
    loadClients();
  }, []);


  const loadClients = async () => {
    const data = await getClientsLocal();
    setClients(data);
  };

  const loadExercisesByClientId = async (clientId: number) => {
    const allExercises = await getExercisesLocal();
    setClientExercises(allExercises.filter(ex => ex.id_client === clientId));
  }



  const toggleExpand = (clientId: number) => {
    setExpandedClientId(prev => (prev === clientId ? null : clientId));
    loadExercisesByClientId(clientId);
  };

  const deleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    await deleteCientLocal(clientToDelete);
    loadClients();
    setShowAlert(false);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clientes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonGrid>
          <IonRow className="ion-align-items-center ion-justify-content-between">
            <IonCol size="12" size-md="6">
              <IonSearchbar
                placeholder="Buscar por nombre o teléfono"
                value={searchTerm}
                onIonInput={(e) => {
                  const value = (e.target as HTMLIonSearchbarElement).value || "";
                  setSearchTerm(value);
                }}
                debounce={100}
              />


            </IonCol>
            <IonCol size="12" size-md="6" className="ion-text-right">
              <IonButton fill="outline" onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}>
                Cambiar a vista {viewMode === "table" ? "tarjetas" : "tabla"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>



        {clients.length === 0 ? (
          // Si no hay clientes, mostrar mensaje
          <IonText className="ion-padding-top ion-padding-bottom">
            <p>Para añadir un nuevo cliente, pulsa el botón de "Añadir Cliente"</p>
          </IonText>

        ) : (

          // Si hay clientes, mostrar en modo tabla o tarjetas
          viewMode === "table" ? (
            <IonGrid className="table-bordered">
              <IonRow className="header-row">
                <IonCol>Nombre</IonCol>
                <IonCol>Teléfono</IonCol>
                  <IonCol>Acciones</IonCol>
                </IonRow>
                {filteredClients.map(client => (
                  <React.Fragment key={client.id}>
                    <IonRow>
                      <IonCol>{client.name}</IonCol>
                      <IonCol>{client.phone}</IonCol>
                      <IonCol className="ion-text-right">
                        <IonButton size="small" color="warning" onClick={() => history.push(`/client-form/${client.id}`)}>
                          <IonIcon icon={pencilOutline} />
                        </IonButton>
                        <IonButton size="small" color="danger" onClick={() => deleteClient(client)}>
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                        <IonButton size="small" fill="clear" onClick={() => toggleExpand(client.id)}>
                          <IonIcon icon={expandedClientId === client.id ? chevronUpOutline : chevronDownOutline} />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                    {expandedClientId === client.id && (
                      clientExercises.length > 0 ? (
                        <IonRow className="exercise-wrapper-row">
                          <IonCol col-span="12" className="no-padding">
                            <IonGrid className="table-bordered exercises-subtable">
                              <IonRow className="header-row exercises-header">
                                <IonCol>Ejercicio</IonCol>
                                <IonCol>Peso (kg)</IonCol>
                                <IonCol>Reps</IonCol>
                              </IonRow>

                              {clientExercises.map((ex, i) => (
                                <IonRow key={i}>
                                  <IonCol>{ex.name}</IonCol>
                                  <IonCol>{ex.max_weight}</IonCol>
                                  <IonCol>{ex.max_reps}</IonCol>
                                </IonRow>
                              ))}
                            </IonGrid>
                          </IonCol>
                        </IonRow>
                      ) : (
                        <IonRow className="exercise-wrapper-row">
                          <IonCol col-span="12" className="text-center no-padding">
                            <em>Sin ejercicios añadidos</em>
                          </IonCol>
                        </IonRow>
                      )
                    )}



                  </React.Fragment>
                ))}
              </IonGrid>
            ) : (
              filteredClients.map(client => (
                <IonCard key={client.id} className="client-card">
                  <IonCardHeader>
                    <IonGrid>
                      <IonRow className="ion-align-items-center ion-justify-content-between">
                        <IonCol>
                          <strong style={{ fontSize: '1.2rem' }}>{client.name}</strong><br />
                          <span>{client.phone}</span>
                        </IonCol>
                        <IonCol size="auto" className="ion-text-right">
                          <IonButton size="small" color="warning" onClick={() => history.push(`/client-form/${client.id}`)}>
                            <IonIcon icon={pencilOutline} />
                          </IonButton>
                          <IonButton size="small" color="danger" onClick={() => deleteClient(client)}>
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                          <IonButton size="small" fill="clear" onClick={() => toggleExpand(client.id)}>
                            <IonIcon icon={expandedClientId === client.id ? chevronUpOutline : chevronDownOutline} />
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardHeader>
                  {expandedClientId === client.id && (
                    <IonCardContent>
                      {clientExercises.length > 0 ? (
                        <IonGrid className="table-bordered exercises-table">
                          <IonRow className="header-row">
                            <IonCol>Ejercicio</IonCol>
                            <IonCol>Peso (kg)</IonCol>
                            <IonCol>Reps</IonCol>
                          </IonRow>
                          {clientExercises.map((ex, i) => (
                            <IonRow key={i}>
                              <IonCol>{ex.name}</IonCol>
                              <IonCol>{ex.max_weight}</IonCol>
                              <IonCol>{ex.max_reps}</IonCol>
                            </IonRow>
                          ))}
                        </IonGrid>
                      ) : (
                        <p>Sin ejercicios registrados</p>
                      )}
                    </IonCardContent>
                  )}
                </IonCard>
              ))
          )

        )}




        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Eliminar Cliente"
          message={`¿Seguro que quieres eliminar a ${clientToDelete?.name}?`}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Eliminar", role: "destructive", handler: confirmDelete },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ClientsList;
