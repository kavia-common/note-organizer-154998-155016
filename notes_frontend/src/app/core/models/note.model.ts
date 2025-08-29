export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number; // epoch ms
  createdAt: number; // epoch ms
  tags?: string[];
}
