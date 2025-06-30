import {
 IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonText
} from "@ionic/react";
import { add, pencilOutline, trashOutline } from "ionicons/icons";
import { Client } from "../../types/client";
import { Exercise } from "../../types/exercise";
import { ExerciseList } from "../exercise/ExerciseList"  /* mismo componente de la respuesta anterior */

interface Props {
 clients: Client[];
 getExercises: (clientId: number) => Exercise[];
 onAddExercise: (id: number) => void;
 onEdit: (id: number) => void;
 onDelete: (client: Client) => void;
}

const ClientsListCards: React.FC<Props> = ({
 clients, getExercises, onAddExercise, onEdit, onDelete
}) => (
 <IonAccordionGroup expand="inset">
  {clients.map(client => {
   const exs = getExercises(client.id);

   return (
    <IonAccordion value={`client-${client.id}`} key={client.id} className="client-accordion">
     <IonItem slot="header" color="light" lines="inset">
      <IonLabel>
       <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{client.name}</div>
       <div style={{ fontSize: "0.9rem", color: "#666" }}>{client.phone}</div>
      </IonLabel>
      <IonButtons slot="end">
       <IonButton size="small" color="success" onClick={e => { e.stopPropagation(); onAddExercise(client.id); }}>
        <IonIcon icon={add} />
       </IonButton>
       <IonButton size="small" color="warning" onClick={e => { e.stopPropagation(); onEdit(client.id); }}>
        <IonIcon icon={pencilOutline} />
       </IonButton>
       <IonButton size="small" color="danger" onClick={e => { e.stopPropagation(); onDelete(client); }}>
        <IonIcon icon={trashOutline} />
       </IonButton>
      </IonButtons>
     </IonItem>

     <div slot="content" className="ion-padding">
      {exs.length === 0 ? (
       <IonText><em>Sin ejercicios aún.</em></IonText>
      ) : (
       <ExerciseList exercises={exs} />
      )}
     </div>
    </IonAccordion>
   );
  })}
 </IonAccordionGroup>
);

export default ClientsListCards;
