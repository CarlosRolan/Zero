import { Progress } from "./progress";


export type Exercise = {
 id: number;
 name: string;
 icon?: string;
 max_weight: number;
 max_reps: number;
 progress?: Progress[];
 id_client: number;
};


