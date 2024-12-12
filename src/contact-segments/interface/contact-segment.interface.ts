import { Document } from 'mongoose';

export interface IContactSegment extends Document {
  name: string;
  conditions: ConditionGroup[];
  business: string;
}
interface ConditionGroup {
  conditions: Condition[];
}

interface Condition {
  attribute: string;
  operator: string;
  value: string;
}
