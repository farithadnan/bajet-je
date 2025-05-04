import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";

export function totalPercentageValidator(): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    if (!(formArray instanceof FormArray)) {
      return null;
    }

    const total = formArray.controls
      .map(group => Number(group.get('percentage')?.value || 0))
      .reduce((sum, current) => sum + current, 0);

    return total > 100 ? { totalExceeded: true } : null;
  }
}
