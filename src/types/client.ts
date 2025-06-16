export type Client = {
  id: number;
  name: string;
  phone: string;
  exercises: Exercise[];
};

export type Exercise = {
  name: string;
  weight: number;
  reps: number;
};
