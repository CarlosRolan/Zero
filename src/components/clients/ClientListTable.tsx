import {
 IonGrid, IonRow, IonCol, IonButton, IonIcon
} from "@ionic/react";
import { add, pencilOutline, trashOutline, chevronUpOutline, chevronDownOutline } from "ionicons/icons";
import { Client } from "../../types/client";
import { Exercise } from "../../types/exercise";
import { ExerciseTable } from "../exercise/ExerciseTable";
import React from "react";


interface Props {
 clients: Client[];
 expandedClientId: number | null;
 onToggleExpand: (id: number) => void;
 getExercises: (clientId: number) => Exercise[];
 onAddExercise: (id: number) => void;
 onEdit: (id: number) => void;
 onDelete: (client: Client) => void;
}

const ClientsListTable: React.FC<Props> = ({
 clients, expandedClientId, onToggleExpand,
 getExercises, onAddExercise, onEdit, onDelete
}) => (
 <IonGrid className="table-bordered">
  <IonRow className="header-row">
   <IonCol>Nombre</IonCol>
   <IonCol>Teléfono</IonCol>
   <IonCol>Ejercicios</IonCol>
   <IonCol>Acciones</IonCol>
  </IonRow>

  {clients.map(client => {
   const exs = getExercises(client.id);
   const isOpen = expandedClientId === client.id;

   return (
    <React.Fragment key={client.id}>
     <IonRow>
      <IonCol>{client.name}</IonCol>
      <IonCol>{client.phone}</IonCol>
      <IonCol>
       <IonButton size="small" color="success" onClick={() => onAddExercise(client.id)}>
        <IonIcon icon={add} />
       </IonButton>
       <IonButton size="small" fill="clear" onClick={() => onToggleExpand(client.id)}>
        <IonIcon icon={isOpen ? chevronUpOutline : chevronDownOutline} />
       </IonButton>
      </IonCol>
      <IonCol>
       <IonButton size="small" color="warning" onClick={() => onEdit(client.id)}>
        <IonIcon icon={pencilOutline} />
       </IonButton>
       <IonButton size="small" color="danger" onClick={() => onDelete(client)}>
        <IonIcon icon={trashOutline} />
       </IonButton>
      </IonCol>
     </IonRow>

     {isOpen && (
      exs.length ? (
       <IonRow className="exercise-wrapper-row">
        <IonCol size="12">
         <ExerciseTable exercises={exs} />
        </IonCol>
       </IonRow>
      ) : (
       <IonRow className="exercise-wrapper-row">
        <IonCol size="12" className="ion-text-center">
         <em>Sin ejercicios añadidos</em>
        </IonCol>
       </IonRow>
      )
     )}
    </React.Fragment>
   );
  })}
 </IonGrid>
);

export default ClientsListTable;
