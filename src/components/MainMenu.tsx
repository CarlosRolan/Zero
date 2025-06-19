import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonMenuToggle,
  IonLabel,
  IonIcon,
  IonMenu
} from "@ionic/react";

import {
  homeOutline,
  addCircleOutline,
  peopleOutline,
  shareOutline
} from "ionicons/icons";

const MainMenu: React.FC = () => (
  <IonMenu contentId="main" type="overlay">
    <IonHeader>
      <IonToolbar>
        <IonTitle>Zero Manager</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonList>
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/home" routerDirection="none">
            <IonIcon slot="start" icon={homeOutline} />
            <IonLabel>Inicio</IonLabel>
          </IonItem>
        </IonMenuToggle>
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/client-form" routerDirection="none">
            <IonIcon slot="start" icon={addCircleOutline} />
            <IonLabel>Nuevo Cliente</IonLabel>
          </IonItem>
        </IonMenuToggle>
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/clients" routerDirection="none">
            <IonIcon slot="start" icon={peopleOutline} />
            <IonLabel>Clientes</IonLabel>
          </IonItem>
        </IonMenuToggle>
        <IonMenuToggle autoHide={false}>
          <IonItem routerLink="/exports" routerDirection="none">
            <IonIcon slot="start" icon={shareOutline} />
            <IonLabel>Exportar</IonLabel>
          </IonItem>
        </IonMenuToggle>
      </IonList>
    </IonContent>
  </IonMenu>
);

export default MainMenu;
