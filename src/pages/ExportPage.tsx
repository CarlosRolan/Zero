import {
 IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
 IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonSearchbar, IonList
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { Client } from "../types/client";
import { getStorage } from "../data/storage/storage";
import * as XLSX from "xlsx";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { getClientsLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
import { Exercise } from "../types/exercise";

const ExportPage: React.FC = () => {
 const [allClients, setAllClients] = useState<Client[]>([]);
 const [allExercises, setAllExercises] = useState<Exercise[]>([]);
 const [filteredClients, setFilteredClients] = useState<Client[]>([]);
 const [searchText, setSearchText] = useState("");
 const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

 useEffect(() => {

  const getData = async () => {

   try {
    const data: Client[] = await getClientsLocal();
    const exercisesData: Exercise[] = await getExercisesLocal();

    setAllClients(data);
    setFilteredClients(data);
    setAllExercises(exercisesData)

   } catch (error) {
    console.error("Error al obtener los datos:", error);
   }
  }

 }, []);

 const handleSearch = (text: string) => {
  setSearchText(text);
  setFilteredClients(
   allClients.filter(c =>
    c.name.toLowerCase().includes(text.toLowerCase()) ||
    c.phone.includes(text)
   )
  );
 };

 const exportToExcel = async (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  if (Capacitor.isNativePlatform()) {
   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
   const reader = new FileReader();

   reader.onload = async () => {
    const base64 = (reader.result as string).split(",")[1];
    await Filesystem.writeFile({
     path: `${filename}.xlsx`,
     data: base64,
     directory: Directory.Documents,
     encoding: Encoding.UTF8,
    });
    alert(`Archivo guardado como ${filename}.xlsx`);
   };

   reader.readAsDataURL(blob);
  } else {
   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
   const link = document.createElement("a");
   link.href = window.URL.createObjectURL(blob);
   link.download = `${filename}.xlsx`;
   link.click();
  }
 };

 const exportAllClients = () => {
  const clientSheet = allClients.map(client => ({
   ID: client.id,
   Nombre: client.name,
   Teléfono: client.phone,
  }));

  const exerciseSheet = allClients.flatMap(client =>
   allExercises.map(ex => ({
    ClienteID: client.id,
    Cliente: client.name,
    Ejercicio: ex.name,
    Peso: ex.max_weight,
    Reps: ex.max_reps
   }))
  );

  const workbook = XLSX.utils.book_new();

  const clientWorksheet = XLSX.utils.json_to_sheet(clientSheet);
  const exerciseWorksheet = XLSX.utils.json_to_sheet(exerciseSheet);

  XLSX.utils.book_append_sheet(workbook, clientWorksheet, "Clientes");
  XLSX.utils.book_append_sheet(workbook, exerciseWorksheet, "Ejercicios");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  if (Capacitor.isNativePlatform()) {
   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
   const reader = new FileReader();

   reader.onload = async () => {
    const base64 = (reader.result as string).split(",")[1];
    await Filesystem.writeFile({
     path: "clientes_y_ejercicios.xlsx",
     data: base64,
     directory: Directory.Documents,
     encoding: Encoding.UTF8,
    });
    alert("Archivo guardado correctamente");
   };

   reader.readAsDataURL(blob);
  } else {
   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
   const link = document.createElement("a");
   link.href = window.URL.createObjectURL(blob);
   link.download = "clientes_y_ejercicios.xlsx";
   link.click();
  }
 };


 const exportSingleClient = () => {
  const client = allClients.find(c => c.id === selectedClientId);
  if (!client) return;

  const exercisesForClient = allExercises.filter(ex => ex.id_client === client.id);

  const data = exercisesForClient
   ? exercisesForClient.map(ex => ({
    Cliente: client.name,
    Teléfono: client.phone,
    Ejercicio: ex.name,
    Peso: ex.max_weight,
    Reps: ex.max_reps
   }))
   : [{
    Cliente: client.name,
    Teléfono: client.phone,
    Ejercicio: "Sin ejercicios",
    Peso: "-",
    Reps: "-"
   }];

  exportToExcel(data, `cliente_${client.name}`);
 };

 return (
  <IonPage>
   <IonHeader>
    <IonToolbar>
     <IonTitle>Exportar Clientes</IonTitle>
    </IonToolbar>
   </IonHeader>
   <IonContent className="ion-padding">
    <IonButton expand="block" color="success" onClick={exportAllClients}>
     Exportar Todos a Excel
    </IonButton>

    <IonItem className="ion-margin-top">
     <IonLabel>Buscar Cliente</IonLabel>
    </IonItem>
    <IonSearchbar
     value={searchText}
     onIonInput={e => handleSearch(e.detail.value!)}
     placeholder="Nombre o teléfono"
    />

    <IonList>
     {filteredClients.map(client => (
      <IonItem
       key={client.id}
       button
       onClick={() => setSelectedClientId(client.id)}
       color={selectedClientId === client.id ? "light" : ""}
      >
       <IonLabel>{client.name} ({client.phone})</IonLabel>
      </IonItem>
     ))}
    </IonList>

    <IonButton
     expand="block"
     color="primary"
     disabled={!selectedClientId}
     onClick={exportSingleClient}
    >
     Exportar Cliente Seleccionado
    </IonButton>
   </IonContent>
  </IonPage>
 );
};

export default ExportPage;
