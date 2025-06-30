import React, { useState } from "react";
import {
 IonPage,
 IonHeader,
 IonToolbar,
 IonTitle,
 IonContent,
 IonItem,
 IonLabel,
 IonSearchbar,
 IonButton,
 IonList,
 useIonViewWillEnter
} from "@ionic/react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

import { Client } from "../types/client";
import { Exercise } from "../types/exercise";
import { getClientsLocal } from "../data/storage/clientStorage";
import { getExercisesLocal } from "../data/storage/exerciseStorage";
// const XLSX = require("xlsx-style");
import * as XLSX from "xlsx";

/* ────────────────────────────────────────────────
   ESTILOS DE CELDA (sin tipos)
────────────────────────────────────────────────── */
const styleClientHeader = {
 font: { bold: true, color: { rgb: "FFFFFF" } },
 fill: { patternType: "solid", fgColor: { rgb: "003366" } },
 alignment: { horizontal: "center", vertical: "center" }
} as any;

const styleExerciseHeader = {
 font: { bold: true },
 fill: { patternType: "solid", fgColor: { rgb: "DDDDDD" } },
 alignment: { horizontal: "center", vertical: "center" }
} as any;

/* Helper para aplicar estilo a la fila 1 */
const applyHeaderStyle = (sheet: any, numCols: number, style: any) => {
 for (let c = 0; c < numCols; c++) {
  const colLetter = String.fromCharCode(65 + c);
  const cell = sheet[`${colLetter}1`];
  if (cell) cell.s = style;
 }
};

const ExportPage: React.FC = () => {
 const [allClients, setAllClients] = useState<Client[]>([]);
 const [allExercises, setAllExercises] = useState<Exercise[]>([]);
 const [filteredClients, setFilteredClients] = useState<Client[]>([]);
 const [searchText, setSearchText] = useState("");
 const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

 /* ─── Carga inicial ─── */
 useIonViewWillEnter(() => {
  (async () => {
   try {
    const clients = await getClientsLocal();
    const exercises = await getExercisesLocal();
    setAllClients(clients);
    setFilteredClients(clients);
    setAllExercises(exercises);
   } catch (err) {
    console.error("Error al obtener datos:", err);
   }
  })();
 }, []);

 /* ─── Buscador ─── */
 const handleSearch = (txt: string) => {
  setSearchText(txt);
  setFilteredClients(
   allClients.filter(
    (c) =>
     c.name.toLowerCase().includes(txt.toLowerCase()) ||
     c.phone.includes(txt)
   )
  );
 };

 /* ─── Guardar libro Excel ─── */
 const saveWorkbook = async (workbook: any, filename: string) => {
  const buf = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  if (Capacitor.isNativePlatform()) {
   const blob = new Blob([buf], { type: "application/octet-stream" });
   const reader = new FileReader();
   reader.onload = async () => {
    const base64 = (reader.result as string).split(",")[1];
    await Filesystem.writeFile({
     path: `${filename}.xlsx`,
     data: base64,
     directory: Directory.Documents,
     encoding: Encoding.UTF8
    });
    alert(`Archivo guardado como ${filename}.xlsx`);
   };
   reader.readAsDataURL(blob);
  } else {
   const blob = new Blob([buf], { type: "application/octet-stream" });
   const link = document.createElement("a");
   link.href = URL.createObjectURL(blob);
   link.download = `${filename}.xlsx`;
   link.click();
  }
 };

 /* ────────────────────────────────────────────────
    EXPORTAR TODOS
 ────────────────────────────────────────────────── */
 const exportAllClients = () => {
  /* Sheet 1: Clientes */
  const clientSheetData = allClients.map((cl) => ({
   Nombre: cl.name,
   Teléfono: cl.phone,
   Ejercicios: allExercises
    .filter((ex) => ex.id_client === cl.id)
    .map((ex) => ex.name)
    .join(", ") || "Sin ejercicios"
  }));

  /* Sheet 2: Ejercicios */
  const exerciseSheetData = allExercises.map((ex) => {
   const cl = allClients.find((c) => c.id === ex.id_client);
   return {
    Cliente: cl ? cl.name : "Desconocido",
    Teléfono: cl ? cl.phone : "—",
    Ejercicio: ex.name,
    Peso: ex.max_weight,
    Reps: ex.max_reps
   };
  });

  /* Sheet 3: Progreso (vacío) */
  const progressHeaders = [
   { Cliente: "", Ejercicio: "", Mes: "", Peso: "", Reps: "" }
  ];

  /* Sheet 4: Resumen (cliente + ejercicios tabulados) */
  const resumenSheet = XLSX.utils.aoa_to_sheet([]);
  let row = 0;

  allClients.forEach((cl) => {
   /* Header Cliente */
   XLSX.utils.sheet_add_aoa(resumenSheet, [["Cliente", "Teléfono"]], {
    origin: { r: row, c: 0 }
   });
   resumenSheet[`A${row + 1}`].s = styleClientHeader;
   resumenSheet[`B${row + 1}`].s = styleClientHeader;
   row++;

   /* Datos cliente */
   XLSX.utils.sheet_add_aoa(resumenSheet, [[cl.name, cl.phone]], {
    origin: { r: row, c: 0 }
   });
   row++;

   /* Fila vacía */
   row++;

   /* Header Ejercicios */
   XLSX.utils.sheet_add_aoa(
    resumenSheet,
    [["", "Ejercicio", "Peso", "Reps"]],
    { origin: { r: row, c: 0 } }
   );
   ["B", "C", "D"].forEach((col) => {
    resumenSheet[`${col}${row + 1}`].s = styleExerciseHeader;
   });
   row++;

   /* Ejercicios del cliente */
   const exs = allExercises.filter((ex) => ex.id_client === cl.id);
   if (exs.length) {
    exs.forEach((ex) => {
     XLSX.utils.sheet_add_aoa(
      resumenSheet,
      [["", ex.name, ex.max_weight, ex.max_reps]],
      { origin: { r: row, c: 0 } }
     );
     row++;
    });
   } else {
    XLSX.utils.sheet_add_aoa(
     resumenSheet,
     [["", "Sin ejercicios", "-", "-"]],
     { origin: { r: row, c: 0 } }
    );
    row++;
   }

   /* Separación entre clientes */
   row++;
  });

  /* Construir libro */
  const wb = XLSX.utils.book_new();

  const wsClients = XLSX.utils.json_to_sheet(clientSheetData);
  applyHeaderStyle(wsClients, 3, styleClientHeader);
  XLSX.utils.book_append_sheet(wb, wsClients, "Clientes");

  const wsExercises = XLSX.utils.json_to_sheet(exerciseSheetData);
  applyHeaderStyle(wsExercises, 5, styleExerciseHeader);
  XLSX.utils.book_append_sheet(wb, wsExercises, "Ejercicios");

  const wsProgress = XLSX.utils.json_to_sheet(progressHeaders);
  applyHeaderStyle(wsProgress, 5, styleExerciseHeader);
  XLSX.utils.book_append_sheet(wb, wsProgress, "Progreso");

  XLSX.utils.book_append_sheet(wb, resumenSheet, "Resumen");

  /* Guardar */
  saveWorkbook(wb, "clientes_ejercicios_progreso");
 };

 /* ────────────────────────────────────────────────
    EXPORTAR UN SOLO CLIENTE
 ────────────────────────────────────────────────── */
 /* ────────────────────────────────────────────────
    EXPORTAR UN SOLO CLIENTE
 ────────────────────────────────────────────────── */
 const exportSingleClient = () => {
  const cl = allClients.find((c) => c.id === selectedClientId);
  if (!cl) return;

  /* ---------- Hoja 1: Clientes (solo uno) ---------- */
  const clientSheetData = [
   {
    Nombre: cl.name,
    Teléfono: cl.phone,
    Ejercicios: allExercises
     .filter((ex) => ex.id_client === cl.id)
     .map((ex) => ex.name)
     .join(", ") || "Sin ejercicios"
   }
  ];

  /* ---------- Hoja 2: Ejercicios (del cliente) ---------- */
  const exerciseSheetData = allExercises
   .filter((ex) => ex.id_client === cl.id)
   .map((ex) => ({
    Cliente: cl.name,
    Teléfono: cl.phone,
    Ejercicio: ex.name,
    Peso: ex.max_weight,
    Reps: ex.max_reps
   }));

  /* ---------- Hoja 3: Progreso (vacía) ---------- */
  const progressHeaders = [
   { Cliente: "", Ejercicio: "", Mes: "", Peso: "", Reps: "" }
  ];

  /* ---------- Hoja 4: Resumen (cliente + ejercicios) ---------- */
  const resumenSheet = XLSX.utils.aoa_to_sheet([]);
  let row = 0;

  // Header Cliente
  XLSX.utils.sheet_add_aoa(resumenSheet, [["Cliente", "Teléfono"]], {
   origin: { r: row, c: 0 }
  });
  resumenSheet[`A${row + 1}`].s = styleClientHeader;
  resumenSheet[`B${row + 1}`].s = styleClientHeader;
  row++;

  // Datos cliente
  XLSX.utils.sheet_add_aoa(resumenSheet, [[cl.name, cl.phone]], {
   origin: { r: row, c: 0 }
  });
  row++;

  // Fila vacía
  row++;

  // Header Ejercicios
  XLSX.utils.sheet_add_aoa(
   resumenSheet,
   [["", "Ejercicio", "Peso", "Reps"]],
   { origin: { r: row, c: 0 } }
  );
  ["B", "C", "D"].forEach((col) => {
   resumenSheet[`${col}${row + 1}`].s = styleExerciseHeader;
  });
  row++;

  // Ejercicios del cliente
  const exs = allExercises.filter((ex) => ex.id_client === cl.id);
  if (exs.length) {
   exs.forEach((ex) => {
    XLSX.utils.sheet_add_aoa(
     resumenSheet,
     [["", ex.name, ex.max_weight, ex.max_reps]],
     { origin: { r: row, c: 0 } }
    );
    row++;
   });
  } else {
   XLSX.utils.sheet_add_aoa(
    resumenSheet,
    [["", "Sin ejercicios", "-", "-"]],
    { origin: { r: row, c: 0 } }
   );
  }

  /* ---------- Construir y guardar libro ---------- */
  const wb = XLSX.utils.book_new();

  // Clientes
  const wsClient = XLSX.utils.json_to_sheet(clientSheetData);
  applyHeaderStyle(wsClient, 3, styleClientHeader);
  XLSX.utils.book_append_sheet(wb, wsClient, "Clientes");

  // Ejercicios
  const wsExercises = XLSX.utils.json_to_sheet(exerciseSheetData);
  applyHeaderStyle(wsExercises, 5, styleExerciseHeader);
  XLSX.utils.book_append_sheet(wb, wsExercises, "Ejercicios");

  // Progreso
  const wsProgress = XLSX.utils.json_to_sheet(progressHeaders);
  applyHeaderStyle(wsProgress, 5, styleExerciseHeader);
  XLSX.utils.book_append_sheet(wb, wsProgress, "Progreso");

  // Resumen
  XLSX.utils.book_append_sheet(wb, resumenSheet, "Resumen");

  saveWorkbook(wb, `cliente_${cl.name}`);
 };


 /* ────────────────────────────────────────────────
    UI
 ────────────────────────────────────────────────── */
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
     onIonInput={(e) => handleSearch(e.detail.value!)}
     placeholder="Nombre o teléfono"
    />

    <IonList>
     {filteredClients.map((cl) => (
      <IonItem
       key={cl.id}
       button
       onClick={() => setSelectedClientId(cl.id)}
       color={selectedClientId === cl.id ? "light" : ""}
      >
       <IonLabel>
        {cl.name} ({cl.phone})
       </IonLabel>
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
