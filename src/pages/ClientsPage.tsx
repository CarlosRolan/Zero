import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonSearchbar,
  IonSpinner, IonToast, IonAlert
} from "@ionic/react";
import React, { useState } from "react";
import { useIonViewWillEnter } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { add } from "ionicons/icons";

import { Client } from "../types/client";
import { Exercise } from "../types/exercise";
import { getClientsLocal, deleteClientLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
import ClientsListCards from "../components/clients/ClientListCards";
import ClientsListTable from "../components/clients/ClientListTable";

const ClientsPage: React.FC = () => {
  /* ---------- state ---------- */
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [expandedClientId, setExpanded] = useState<number | null>(null);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const loadData = async () => {
    setLoading(true);
    const [cl, ex] = await Promise.all([getClientsLocal(), getExercisesLocal()]);
    setClients(cl);
    setExercises(ex);
    setExpanded(null);
    setLoading(false);
  };

  const exercisesByClient = (id: number) =>
    exercises.filter((e) => e.id_client === id);

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  useIonViewWillEnter(() => {
    // lanzamos una función async auto-ejecutada para poder usar await
    void (async () => {
      try {
        setLoading(true);

        // 🔹 Disparamos las dos lecturas a la vez
        const clientsPromise = getClientsLocal();
        const exercisesPromise = getExercisesLocal();

        // Esperamos ambas y desestructuramos con nombres descriptivos
        const [clients, exercises] = await Promise.all([
          clientsPromise,
          exercisesPromise
        ]);

        // Guardamos en estado
        setClients(clients);
        setExercises(exercises);
        setExpanded(null);   // cerramos cualquier acordeón abierto
      } catch (err) {
        console.error("Error cargando datos:", err);
        // Aquí puedes mostrar un toast o retry según necesites
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  /* ---------- UI callbacks ---------- */
  const toggleExpand = (id: number) =>
    setExpanded(prev => (prev === id ? null : id));

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    await deleteClientLocal(toDeleteId);
    loadData();
  };

  /* ---------- render ---------- */
  const renderList = () =>
    viewMode === "table" ? (
      <ClientsListTable
        clients={filteredClients}
        expandedClientId={expandedClientId}
        onToggleExpand={toggleExpand}
        getExercises={exercisesByClient}
        onAddExercise={(id) => history.push(`/exercise-form/${id}`)}
        onEdit={(id) => history.push(`/client-form/${id}`)}
        onDelete={(c) => { setToDeleteId(c.id); }}
      />
    ) : (
      <ClientsListCards
        clients={filteredClients}
        getExercises={exercisesByClient}
        onAddExercise={(id) => history.push(`/exercise-form/${id}`)}
        onEdit={(id) => history.push(`/client-form/${id}`)}
        onDelete={(c) => { setToDeleteId(c.id); }}
      />
    );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Clientes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ----- barra de búsqueda + toggle de vista ----- */}
        <IonGrid>
          <IonRow className="ion-align-items-center ion-justify-content-between">
            <IonCol size="12" size-md="6">
              <IonSearchbar
                placeholder="Buscar por nombre o teléfono"
                value={search}
                debounce={100}
                onIonInput={e => setSearch((e.target as HTMLIonSearchbarElement).value!)}
              />
            </IonCol>
            <IonCol size="12" size-md="6" className="ion-text-right">
              <IonButton
                fill="outline"
                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              >
                Cambiar a vista {viewMode === "table" ? "tarjetas" : "tabla"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* ----- listado ----- */}
        {loading ? (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
            <p>Cargando clientes…</p>
          </div>
        ) : clients.length === 0 ? (
          <>
            <p>No hay ningún cliente.</p>
            <IonButton expand="block" onClick={() => history.push("/client-form/")}>
              Crear cliente
            </IonButton>
          </>
        ) : (
          renderList()
        )}

        {/* ----- alertas y toast ----- */}
        <IonAlert
          isOpen={!!toDeleteId}
          header="Eliminar Cliente"
          message={`¿Seguro que quieres eliminar`}
          buttons={[
            { text: "Cancelar", role: "cancel", handler: () => setToDeleteId(null) },
            { text: "Eliminar", role: "destructive", handler: confirmDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default ClientsPage;
