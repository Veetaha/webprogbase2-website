import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA   } from '@angular/material';
import { CoursesService    } from '@services/courses';
import { Maybe             } from '@common/interfaces';

import * as Gql from '@services/gql';
import * as _   from 'lodash';

export interface TrcEditOptions {
    taskResult: Gql.GetLocalTaskResults.Data;
}

export type TrcEditResult = Maybe<
    ReturnType<Gql.CreateTaskResultCheckGQL['mutate']> |
    ReturnType<Gql.UpdateTaskResultCheckGQL['mutate']>
>;

@Component({
  selector:    'app-trc-edit',
  templateUrl: './trc-edit.component.html',
  styleUrls:  ['./trc-edit.component.scss']
})
export class TrcEditComponent {
    inputCheck: {
        comment: string;
        score: number;
    };


    constructor(
        @Inject(MAT_DIALOG_DATA) public options: TrcEditOptions,
        private backend: CoursesService
    ) { 
        const check = options.taskResult.check;
        this.inputCheck = check
            ? {  comment: check.comment || '',  score: check.score } 
            : {  comment: '',                   score: 0           };
    
    }

    submit(): TrcEditResult {
        const payload = {
            comment: this.inputCheck.comment || null,
            score:   this.inputCheck.score
        };
        const id = this.options.taskResult.id;
        return !this.options.taskResult.check            
            ? this.backend.createTaskResultCheck({ id, payload })
            : this.backend.updateTaskResultCheck({ id, patch: payload });
    }

    cancel(): TrcEditResult {
        return null;
    }
}

