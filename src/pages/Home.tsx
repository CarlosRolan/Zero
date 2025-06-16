import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText
} from "@ionic/react";
import React from "react";

const Home: React.FC = () => {
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
