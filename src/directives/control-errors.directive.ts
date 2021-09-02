import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Host,
  Input,
  Optional,
  ViewContainerRef
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {defaultErrors} from './form-errors';
import {ControlErrorContainerDirective} from './control-error-container.directive';
import {FormSubmitDirective} from './form-submit.directive';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ControlErrorComponent} from '../components/control-error/control-error.component';
import {EmptyObservable} from "rxjs/observable/EmptyObservable";
import {merge} from "rxjs/observable/merge";

@Directive({
  selector: '[formControl], [formControlName]'
})
export class ControlErrorsDirective {
  ref: ComponentRef<ControlErrorComponent>;
  container: ViewContainerRef;
  submit$: any;
  @Input() customErrors = {};
  errors;

  constructor(
    private vcr: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    @Optional() controlErrorContainer: ControlErrorContainerDirective,
    //@Inject(FORM_ERRORS) private errors,
    @Optional() @Host() private form: FormSubmitDirective,
    private controlDir: NgControl) {
    this.errors = defaultErrors;
    this.container = controlErrorContainer ? controlErrorContainer.vcr : vcr;
    this.submit$ = this.form ? this.form.submit$ : EmptyObservable;
  }

  ngOnInit() {
    merge(
      this.submit$,
      this.control.valueChanges,
      this.control.statusChanges
    ).pipe(
      untilDestroyed(this)).subscribe(() => {
      const controlErrors = this.control.errors;
      if (controlErrors) {
        const firstKey = Object.keys(controlErrors)[0];
        const getError = this.errors[firstKey];
        let text;
        if (getError !== undefined) {
          text = this.customErrors[firstKey] || getError(controlErrors[firstKey]);
        } else {
          text = firstKey
        }
        this.setError(text);
      } else if (this.ref) {
        this.setError(null);
      }
    })
  }

  get control() {
    return this.controlDir.control;
  }

  setError(text: string) {
    if (!this.ref) {
      const factory = this.resolver.resolveComponentFactory(ControlErrorComponent);
      this.ref = this.container.createComponent(factory, -1);
    }

    this.ref.instance.text = text;
  }

  ngOnDestroy() {
  }

}
