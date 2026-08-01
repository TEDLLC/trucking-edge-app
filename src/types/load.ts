export interface Load {
  id: string;
  origin: string;
  destination: string;
  driver: string;
  rate: number;
  miles: number;
  fuelCost: number;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Dispatched';
  date: string;
  brokerName?: string;
  assignedDriver?: string;
}