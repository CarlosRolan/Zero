import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText,
  IonButton,
  IonIcon
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import React from "react";

const Home: React.FC = () => {

  const clearData = async () => {
    localStorage.clear();
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h2>Bienvenido a Zero Manager</h2>
          <p>Usa el menú lateral para gestionar tus clientes.</p>
        </IonText>
        <IonButton onClick={clearData}>
          clear
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
