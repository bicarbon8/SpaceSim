import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpaceSimComponent } from './space-sim.component';

const routes: Routes = [
  {path: '', component: SpaceSimComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpaceSimRoutingModule { }
