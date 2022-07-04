import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unitConversion',
})
/**
 * Unit Conversion Pipe
 */
export class UnitConversionPipe implements PipeTransform {
  /**
   * Transform functions
   *
   * @param {any} value
   * @param {Array<any>} args
   * @return {any}
   */
  transform(value: number, ...args: unknown[]): unknown {
    return value/1000000000000000000;
  }
}
