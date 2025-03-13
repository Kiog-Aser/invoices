export interface Notification {
  id?: string;
  userId: string;
  websiteId: string;
  title: string;
  message: string;
  image?: string;
  timestamp: string;
  delay: number;
  createdAt?: Date;
  updatedAt?: Date;
  url: string;
  theme: string;
}