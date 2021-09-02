import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlErrorContainerDirective} from './control-error-container.directive';
import {ControlErrorsDirective} from './control-errors.directive';
import {FormSubmitDirective} from './form-submit.directive';
import {ControlErrorComponent} from '../components/control-error/control-error.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ControlErrorContainerDirective,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorComponent
  ],
  declarations: [
    ControlErrorContainerDirective,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorComponent
  ],
  entryComponents: [
    ControlErrorComponent
  ]
})
export class DirectivesModule {
}
