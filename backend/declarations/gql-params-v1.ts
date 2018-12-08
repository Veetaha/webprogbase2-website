import { User   } from '@models/user';
import * as Mongoose from 'mongoose';

export import ObjectId = Mongoose.Types.ObjectId;
export { User   } from '@models/user';
export { Task   } from '@models/task';
export { Course } from '@models/course';
export { Group  } from '@models/group';
export { TaskResult, TaskResultCheck } from '@models/task-result';
export interface ResolveContext {
    user?: User | null;
}