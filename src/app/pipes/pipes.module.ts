import { NgModule } from '@angular/core';
import { NewlineToBrPipe } from './newline-to-br.pipe';

@NgModule({
  declarations: [NewlineToBrPipe],
  exports: [NewlineToBrPipe]
})
export class PipesModule {}
