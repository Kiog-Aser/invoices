export interface Notification {
  id?: string;
  userId?: string;  // Make optional for client-side use
  websiteId?: string; // Make optional for client-side use
  title: string;
  message: string;
  image?: string;
  timestamp: string;
  delay: number;
  createdAt?: Date;
  updatedAt?: Date;
  url?: string; // Make properly optional
  theme?: string; // Make optional since it might not always be set
}