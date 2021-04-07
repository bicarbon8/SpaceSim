import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpaceSimRoutingModule } from './space-sim-routing.module';
import { SpaceSimComponent } from './space-sim.component';


@NgModule({
  declarations: [
    SpaceSimComponent
  ],
  imports: [
    CommonModule,
    SpaceSimRoutingModule
  ]
})
export class SpaceSimModule { }
