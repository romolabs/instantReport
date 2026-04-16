export interface CategoryOption {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface CategoryRecord extends CategoryOption {
  createdAt: string;
  updatedAt: string;
}
