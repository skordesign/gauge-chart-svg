import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaugeChartComponent } from '@angular-monorepo/gauge-chart';
@Component({
  selector: 'mfe-one-nx-welcome',
  standalone: true,
  imports: [CommonModule, GaugeChartComponent],
  template: `
    <div class="container">
      <gauge-chart [graph]="graph" [layout]="layout"></gauge-chart>
    </div>

    <div class="container">
      <gauge-chart [graph]="graph2" [layout]="layout2"></gauge-chart>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcomeComponent implements OnInit {
  title = 'angular-monorepo';
  graph: any;
  graph2: any;
  layout = {
    showTopIndicator: false,
    radius: 400,
    borderWidth: 20,
    barWidth: 120,
    textStyle: { fontSize: 50 },
    chartStyle: {
      valueColors: ['#111921CC', '#2B3643CC'],
    },
  };
  layout2 = {
    showTopIndicator: false,
    radius: 400,
    borderWidth: 20,
    barWidth: 120,
    textStyle: { fontSize: 50 },
    chartStyle: {
      valueColors: ['#FFFFFF', '#FFFFFF'],
    },
  };
  radius = 50;
  constructor() {
    this.graph = {
      currentValue: 0,
      range: [0, 200],
      borderSteps: [
        {
          from: 0,
          to: 100,
          colors: ['red', 'orange'],
        },
        {
          from: 102,
          to: 150,
          colors: ['yellow', 'purple'],
        },
      ],
    };
    this.graph2 = {
      currentValue: 0,
      range: [0, 200],
      borderSteps: [
        {
          from: 0,
          to: 100,
          colors: ['red', 'orange'],
        },
        {
          from: 102,
          to: 150,
          colors: ['yellow', 'purple'],
        },
      ],
    };
  }
  ngOnInit(): void {
    setInterval(() => {
      this.graph = {
        ...this.graph,
        currentValue: Math.random() * this.graph.range[1],
      };
      this.graph2 = {
        ...this.graph2,
        currentValue: Math.random() * this.graph2.range[1],
      };
    }, 3000);
  }
}
