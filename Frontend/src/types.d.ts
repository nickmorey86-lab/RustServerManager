export {};



export interface Server {
  id: number;
  name: string;
  description: string;
  status: "online" | "offline";
}
