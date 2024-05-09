import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as SNAPSVG_TYPE from 'snapsvg';
declare var Snap: typeof SNAPSVG_TYPE;
declare var mina: any;

@Component({
  selector: 'gauge-chart',
  standalone: true,
  templateUrl: './gauge-chart.component.html',
  styleUrl: './gauge-chart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GaugeChartComponent implements AfterViewInit, OnChanges {
  centerX = 600;
  centerY = 500;
  defaultRadius = 400;
  defaultBarWidth = 100;
  defaultBorderWidth = 20;
  defaultBorderPadding = 0;
  defaultFontSize = 40;
  ngOnChanges(changes: SimpleChanges): void {
    if (this.metric) {
      this._updateChart();
    }
  }
  _updateChart() {
    const metric = this.metric.nativeElement as HTMLElement;
    var svg = Snap(metric.getElementsByTagName('svg')[0]);
    const ratio =
      (this.graph.currentValue - this.graph.range[0]) /
      (this.graph.range[1] - this.graph.range[0]);
    const oldRatio =
      (this._oldValue - this.graph.range[0]) /
      (this.graph.range[1] - this.graph.range[0]);
    this._animateArc(oldRatio, ratio, svg);
    this._animateNeedle(oldRatio, ratio, svg);
    this._oldValue = this.graph.currentValue;
  }
  _oldValue: number = 0;
  _needleLine?: SNAPSVG_TYPE.Element;
  _progress?: SNAPSVG_TYPE.Element;
  _circle?: SNAPSVG_TYPE.Element;
  _dot?: SNAPSVG_TYPE.Element;
  _border?: SNAPSVG_TYPE.Element;
  _valueGraId?: string;
  _outlineGraId?: string;
  _bgGraId?: string;
  @ViewChild('metric') metric!: ElementRef;
  @Input() layout?: {
    needleLen?: number;
    needleColor?: string;
    needleRootRadius?: number;
    needleWidth?: number;
    showTopIndicator?: boolean;
    indicatorSize?: number;
    indicatorColor?: string;
    borderWidth?: number;
    barWidth?: number;
    radius?: number;
    borderPadding?: number;
    textStyle?: {
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      fontWeight?: string;
    };
    chartStyle?: {
      valueColors?: string[];
      borderColors?: string[];
      backgroundColors?: string[];
    };
  };
  @Input({ required: true }) graph!: {
    currentValue: number;
    range: number[];
    borderSteps?: {
      from: number;
      to: number;
      colors: string[];
    }[];
  };
  get backgroundPath() {
    const radius = this.layout?.radius ?? this.defaultRadius;
    const x0 = this.centerX + radius;
    const x1 = this.centerX - radius;
    return `M ${x0} 500 A 1 1 0 0 0 ${x1} 500`;
  }
  ngAfterViewInit(): void {
    this.initChart();
  }
  initChart() {
    const metric = this.metric.nativeElement as HTMLElement;
    var svg = Snap(metric.getElementsByTagName('svg')[0]);
    this._drawBorder(svg);
    this._updateTextStyle(svg);
    this._applyStyle(svg);
    this._updateChart();
  }
  private _drawBorder(svg: SNAPSVG_TYPE.Paper) {
    if ((this.graph.borderSteps ?? []).length == 0) {
      this._drawDefaultBorder(svg);
    } else {
      this._drawStepBorder(svg, this.graph.borderSteps!);
    }
  }
  private _drawStepBorder(
    svg: SNAPSVG_TYPE.Paper,
    steps: { from: number; to: number; colors: string[] }[]
  ) {
    const borderWidth = this.layout?.borderWidth ?? this.defaultBorderWidth;
    const borderRadius =
      (this.layout?.radius ?? this.defaultRadius) +
      (this.layout?.barWidth ?? this.defaultBarWidth) / 2 +
      (this.layout?.borderWidth ?? this.defaultBorderWidth) / 2 +
      (this.layout?.borderPadding ?? this.defaultBorderPadding);
    steps.forEach((step) => {
      var path = this._getSvgArcPath(
        this.centerX,
        this.centerY,
        borderRadius,
        ((step.from - this.graph.range[0]) /
          (this.graph.range[1] - this.graph.range[0])) *
          180 -
          90,
        ((step.to - this.graph.range[0]) /
          (this.graph.range[1] - this.graph.range[0])) *
          180.0 -
          90
      );
      const id = `step-gra-${step.from}-${step.to}`;
      var gradient = svg.gradient(
        `l(0,0,1,1)${step.colors[0]}-${step.colors[1]}`
      );
      gradient.attr({
        id: id,
      });
      var stepPath = svg.path('');
      stepPath.attr({
        d: path,
        stroke: `url(#${id})`,
        'stroke-width': borderWidth,
        fill: 'none',
      });
      svg.select('#outline-group').add(stepPath);
    });
  }
  private _drawDefaultBorder(svg: SNAPSVG_TYPE.Paper) {
    const borderWidth = this.layout?.borderWidth ?? this.defaultBorderWidth;
    const borderRadius =
      (this.layout?.radius ?? this.defaultRadius) +
      (this.layout?.barWidth ?? this.defaultBarWidth) / 2 +
      (this.layout?.borderWidth ?? this.defaultBorderWidth) / 2 +
      (this.layout?.borderPadding ?? this.defaultBorderPadding);
    this._border = svg.path('');
    this._border.attr({
      d: `M ${this.centerX + borderRadius} 500 A 1 1 0 0 0 ${
        this.centerX - borderRadius
      } 500`,
      'stroke-width': borderWidth,
      stroke: `url(#${this._outlineGraId ?? 'outline-gra'})`,
      fill: 'none',
    });
  }
  private _applyStyle(svg: SNAPSVG_TYPE.Paper) {
    this._updateGradient(svg);
    this._updateElementStyle(svg);
  }
  private _updateElementStyle(svg: SNAPSVG_TYPE.Paper) {
    var background = svg.select('#background');
    console.log(this.backgroundPath);
    background.attr({
      'stroke-width': this.layout?.barWidth ?? this.defaultBarWidth,
      fill: 'none',
      stroke: `url(#${this._bgGraId ?? 'bg-gra'})`,
      d: this.backgroundPath,
    });
  }
  private _updateGradient(svg: SNAPSVG_TYPE.Paper) {
    const valueArr = this.layout?.chartStyle?.valueColors ?? [];
    if (valueArr.length == 2) {
      var gra = svg.gradient(`l(0,0.5,1,0.5)${valueArr[0]}-${valueArr[1]}`);
      this._valueGraId = `${valueArr[0]}${valueArr[1]}`.replace('#', '');
      console.log(this._valueGraId);
      gra.attr({
        id: this._valueGraId,
      });
    }
    const outlineArr = this.layout?.chartStyle?.borderColors ?? [];
    if (outlineArr.length == 2) {
      var gra = svg.gradient(`l(0,0.5,1,0.5)${outlineArr[0]}-${outlineArr[1]}`);
      this._outlineGraId = `${outlineArr[0]}${outlineArr[1]}`.replace('#', '');
      gra.attr({
        id: this._outlineGraId,
      });
    }
    const bgArr = this.layout?.chartStyle?.backgroundColors ?? [];
    if (bgArr.length == 2) {
      var gra = svg.gradient(`l(0,0.5,1,0.5)${bgArr[0]}-${bgArr[1]}`);
      this._bgGraId = `${bgArr[0]}${bgArr[1]}`.replace('#', '');
      gra.attr({
        id: this._bgGraId,
      });
    }
  }
  private _updateTextStyle(svg: SNAPSVG_TYPE.Paper) {
    var minText = svg.select('#min-text');
    minText.attr({
      stroke: this.layout?.textStyle?.color ?? '#FFFFFF',
      fill: this.layout?.textStyle?.color ?? '#FFFFFF',
      'font-size': this.layout?.textStyle?.fontSize ?? this.defaultFontSize,
      'font-weight': this.layout?.textStyle?.fontWeight ?? 'normal',
      'font-family': this.layout?.textStyle?.fontFamily,
      x:
        this.centerX -
        (this.layout?.radius ?? this.defaultRadius) -
        (this.layout?.barWidth ?? this.defaultBarWidth) / 2,
      y:
        this.centerY +
        ((this.layout?.textStyle?.fontSize ?? this.defaultFontSize) * 2) / 3,
    });
    var maxText = svg.select('#max-text');
    maxText.attr({
      stroke: this.layout?.textStyle?.color ?? '#FFFFFF',
      fill: this.layout?.textStyle?.color ?? '#FFFFFF',
      'font-size': this.layout?.textStyle?.fontSize ?? this.defaultFontSize,
      'font-weight': this.layout?.textStyle?.fontWeight ?? 'normal',
      'font-family': this.layout?.textStyle?.fontFamily,
      x:
        this.centerX +
        (this.layout?.radius ?? this.defaultRadius) +
        (this.layout?.barWidth ?? this.defaultBarWidth) / 2,
      y:
        this.centerY +
        ((this.layout?.textStyle?.fontSize ?? this.defaultFontSize) * 2) / 3,
    });
  }
  private _animateNeedle(oldRatio: number, ratio: number, svg: Snap.Paper) {
    if (!this._needleLine) {
      this._needleLine = svg.path('');
      this._needleLine.attr({
        'stroke-width': this.layout?.needleWidth ?? 5,
        stroke: this.layout?.needleColor ?? '#FFFFFF',
        fill: 'none',
      });
    }
    var radius =
      ((this.layout?.radius ?? this.defaultRadius) +
        (this.layout?.barWidth ?? this.defaultBarWidth) / 2) *
      (this.layout?.needleLen ?? 1);
    var path;
    if (!this._circle) {
      this._circle = svg.circle(
        this.centerX,
        this.centerY,
        this.layout?.needleRootRadius ?? 20
      );
      this._circle.attr({
        stroke: this.layout?.needleColor ?? '#FFFFFF',
        fill: this.layout?.needleColor ?? '#FFFFFF',
      });
    }
    if (this.layout?.showTopIndicator && !this._dot) {
      this._dot = svg.circle(
        this.centerX,
        this.centerY -
          (this.layout.radius ?? this.defaultRadius) -
          (this.layout.barWidth ?? this.defaultBarWidth) / 2 -
          (this.layout.borderPadding ?? this.defaultBorderPadding) -
          (this.layout.borderWidth ?? this.defaultBorderWidth) / 2,
        this.layout.indicatorSize ?? 5
      );
      this._dot.attr({
        stroke: this.layout?.indicatorColor ?? '#FFFFFF',
        fill: this.layout?.indicatorColor ?? '#FFFFFF',
      });
    }
    return Snap.animate(
      oldRatio,
      ratio,
      (val: any) => {
        var end_xy = this._convertDegToXY(
          this.centerX,
          this.centerY,
          radius,
          val * 180.0 - 90
        );
        path = `M ${this.centerX} ${this.centerY} L ${this.centerX} ${this.centerY} ${end_xy[0]} ${end_xy[1]}`;
        this._needleLine?.attr({
          d: path,
        });
      },
      Math.round(2000 * Math.abs(ratio - oldRatio)),
      mina.easeinout
    );
  }
  private _convertDegToXY(cx: any, cy: any, radius: any, angle: any) {
    var radians;
    radians = ((angle - 90) * Math.PI) / 180.0;
    return [
      Math.round((cx + radius * Math.cos(radians)) * 100) / 100,
      Math.round((cy + radius * Math.sin(radians)) * 100) / 100,
    ];
  }
  private _getSvgArcPath(
    x: any,
    y: any,
    radius: any,
    start_angle: any,
    end_angle: any
  ) {
    var end_xy, start_xy;
    start_xy = this._convertDegToXY(x, y, radius, end_angle);
    end_xy = this._convertDegToXY(x, y, radius, start_angle);
    return (
      'M ' +
      start_xy[0] +
      ' ' +
      start_xy[1] +
      ' A ' +
      radius +
      ' ' +
      radius +
      ' 0 0 0 ' +
      end_xy[0] +
      ' ' +
      end_xy[1]
    );
  }
  private _animateArc(oldRatio: number, ratio: number, svg: Snap.Paper) {
    var radius: any;
    if (!this._progress) {
      this._progress = svg.path('');
      this._progress.attr({
        fill: 'none',
        'stroke-width': (this.layout?.barWidth ?? this.defaultBarWidth) + 2,
        stroke: `url(#${this._valueGraId ?? 'data-gra'})`,
      });
    }
    radius = this.layout?.radius ?? this.defaultRadius;
    return Snap.animate(
      oldRatio,
      ratio,
      (val: any) => {
        var path = this._getSvgArcPath(
          this.centerX,
          this.centerY,
          radius,
          -90,
          val * 180.0 - 90
        );
        this._progress?.attr({
          d: path,
        });
      },
      Math.round(2000 * Math.abs(ratio - oldRatio)),
      mina.easeinout
    );
  }
}
