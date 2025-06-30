import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonIcon, IonAlert, IonCard, IonCardHeader, IonCardContent,
  useIonViewWillEnter,
  IonText,
  IonInput,
  IonSearchbar,
  IonToast,
  IonSpinner,
  IonAccordionGroup,
  IonAccordion,
  IonButtons,
  IonItem,
  IonLabel
} from "@ionic/react";
import { pencilOutline, trashOutline, chevronDownOutline, chevronUpOutline, add, logoWhatsapp } from "ionicons/icons";
import React, { useState, useEffect, use } from "react";
import { Client } from "../types/client";

import { useHistory } from "react-router-dom";
import "./ClientsList.css";
import { deleteClientLocal, getClientsLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
import { Exercise } from "../types/exercise";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Icon } from "ionicons/dist/types/components/icon/icon";

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [clientExercises, setClientExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [wppAlert, setWppAlert] = useState(false);
  const [loading, setLoading] = useState(true);


  const history = useHistory();

  useIonViewWillEnter(() => {
    const rechargeClients = async () => {
      setLoading(true);          // 🔵 empieza carga
      await loadClients();       // tu función que pega a storage / API
      setExpandedClientId(null); // resetea el accordion
      setLoading(false);         // 🟢 termina carga
    };

    rechargeClients();
  }, []);

  /* const shareExercises = async (client: Client) => {

    const exercises = await loadExercisesByClientId(client.id)

    const message =
      exercises.length
        ? `Hola ${client.name}, estos son tus ejercicios:\n\n` +
        exercises
          .map(
            ex => `• ${ex.name}: ${ex.max_weight} kg × ${ex.max_reps} reps`
          )
          .join("\n")
        : `Hola ${client.name}, aún no tienes ejercicios asignados.`;


    try {
      await Share.share({
        title: `Ejercicios de ${client.name}`,
        text: message,
        dialogTitle: "Compartir ejercicios…"
      });
      return;                                 
    } catch {

    }

    if (Capacitor.isNativePlatform()) {
      const fileName = `ejercicios_${client.name}.txt`;
      await Filesystem.writeFile({
        path: fileName,
        data: message,
        directory: Directory.Cache      
      });

      const uri = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName
      });

      await Share.share({
        title: `Ejercicios de ${client.name}`,
        url: uri.uri,                
        dialogTitle: "Compartir ejercicios…"
      });
    } else {
 
      navigator.clipboard.writeText(message);
      alert("Texto copiado al portapapeles (el navegador no soporta compartir archivos).");
    }
  }; */

  const loadClients = async () => {
    const data = await getClientsLocal();
    setClients(data);
  };

  const loadExercisesByClientId = async (clientId: number) => {
    const allExercises = await getExercisesLocal();
    setClientExercises(allExercises.filter(ex => ex.id_client === clientId));

    return allExercises.filter(ex => ex.id_client === clientId);
  }

  const toggleExpand = (clientId: number) => {
    setExpandedClientId(prev => (prev === clientId ? null : clientId));
    loadExercisesByClientId(clientId);
  };

  const deleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowAlert(true);
  };

  const addExerciseToCLient = (clientId: number) => {
    history.push(`/exercise-form/${clientId}`);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    await deleteClientLocal(clientToDelete.id);
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


        <IonContent className="ion-padding">
          {loading ? (
            <div className="ion-text-center">
              <IonSpinner name="crescent" />
              <p>Cargando clientes…</p>
            </div>
          ) : (


              clients.length === 0 ? (
              // Si no hay clientes, mostrar mensaje
                <>
                  <IonText className="ion-padding-top ion-padding-bottom">
                    <p>No hay ningun cliente, nada que listar</p>
                    <p>Para añadir un nuevo cliente, pulsa el botón de "Crear cliente"</p>
                  </IonText>
                  <IonButton expand="block" color="primary" onClick={() => history.push("/client-form/")}>
                    Crear cliente
                  </IonButton>
                </>



              ) : (

                  // Si hay clientes, mostrar en modo tabla o tarjetas
                  viewMode === "table" ? (
                    <IonGrid className="table-bordered">
                      <IonRow className="header-row">
                        <IonCol>Nombre</IonCol>
                        <IonCol>Teléfono</IonCol>
                        <IonCol>Ejercicios</IonCol>
                        <IonCol>Acciones</IonCol>
                      </IonRow>
                      {filteredClients.map(client => (
                        <React.Fragment key={client.id}>
                          <IonRow>
                            <IonCol>{client.name}</IonCol>
                            <IonCol>{client.phone}</IonCol>
                            <IonCol>
                              <IonButton size="small" color="success" onClick={() => addExerciseToCLient(client.id)}>
                                <IonIcon icon={add} />
                              </IonButton>
                              <IonButton size="small" fill="clear" onClick={() => toggleExpand(client.id)}>
                                <IonIcon icon={expandedClientId === client.id ? chevronUpOutline : chevronDownOutline} />
                              </IonButton>
                            </IonCol>
                            <IonCol>
                              {/*  <IonButton
                            size="small"
                            color="success"
                            onClick={() => shareExercises(client)}
                          >

                            <IonIcon icon={logoWhatsapp}></IonIcon>
                          </IonButton> */}

                          <IonButton size="small" color="warning" onClick={() => history.push(`/client-form/${client.id}`)}>
                            <IonIcon icon={pencilOutline} />
                          </IonButton>
                          <IonButton size="small" color="danger" onClick={() => deleteClient(client)}>
                            <IonIcon icon={trashOutline} />
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
                      <IonAccordionGroup expand="inset">
                        {filteredClients.map((client) => {
                          const exs = clientExercises.filter((e) => e.id_client === client.id);
                          return (
                            <IonAccordion value={`client-${client.id}`} key={client.id} className="client-accordion">
                              <IonItem slot="header" color="light" lines="inset" className="client-header">
                                <IonLabel>
                                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{client.name}</div>
                                  <div style={{ fontSize: "0.9rem", color: "#666" }}>{client.phone}</div>
                                </IonLabel>
                                <IonButtons slot="end">
                                  <IonButton size="small" color={"success"} onClick={(e) => { e.stopPropagation(); addExerciseToCLient(client.id); }}>
                                    <IonIcon icon={add} />
                                  </IonButton>
                                  {/*  <IonButton size="small" color="success" onClick={(e) => { e.stopPropagation(); shareExercises(client); }}>
                                    <IonIcon icon={logoWhatsapp} />
                                  </IonButton> */}
                                  <IonButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); history.push(`/client-form/${client.id}`) }}>
                                    <IonIcon icon={pencilOutline} />
                                  </IonButton>
                                  <IonButton size="small" color="danger" onClick={(e) => { e.stopPropagation(); setClientToDelete(client); setShowAlert(true); }}>
                                    <IonIcon icon={trashOutline} />
                                  </IonButton>
                                </IonButtons>
                              </IonItem>

                              <div slot="content" className="ion-padding">
                                {exs.length === 0 ? (
                                  <IonText>
                                    <em>Sin ejercicios aún.</em>
                                  </IonText>
                                ) : (
                                  <IonGrid className="table-bordered exercises-subtable" style={{ fontSize: "0.9rem" }}>
                                    <IonRow className="header-row exercises-header">
                                      <IonCol><strong>Ejercicio</strong></IonCol>
                                      <IonCol><strong>Peso (kg)</strong></IonCol>
                                      <IonCol><strong>Reps</strong></IonCol>
                                    </IonRow>
                                      {exs.map((ex, i) => (
                                  <IonRow key={i}>
                                    <IonCol>{ex.name}</IonCol>
                                    <IonCol>{ex.max_weight}</IonCol>
                                    <IonCol>{ex.max_reps}</IonCol>
                                  </IonRow>
                                ))}
                                    </IonGrid>
                                )}
                              </div>
                            </IonAccordion>
                          );
                        })}
                      </IonAccordionGroup>
                    )

                )
          )}
        </IonContent>





        <IonToast
          isOpen={wppAlert}
          onDidDismiss={() => setWppAlert(false)}
          message={`Este cliente no tiene ejercicios, nada que enviar por WhatsApp.`}
          duration={2000}
        />


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
