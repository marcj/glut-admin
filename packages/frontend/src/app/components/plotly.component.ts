import {Component, ElementRef, Input, SimpleChanges} from "@angular/core";
import {Config, Data, extendTraces, Layout, newPlot, PlotlyHTMLElement, Plots, purge, react} from 'plotly.js';
import {Observable, Subject} from "rxjs/index";
import {Subscriptions} from "@marcj/estdlib-rxjs";
import {eachPair, setPathValue} from "@marcj/estdlib";
import {unsubscribe} from "../reactivate-change-detection";
import {BehaviorSubject} from "rxjs";
import {bufferTime, first} from "rxjs/operators";

export interface ObservableTraceStream {
    x: (number | string | Date)[];
    y: (number | string | Date)[];
}

export interface ObservableTrace {
    name: string;
    data: BehaviorSubject<Data>;
    stream: Subject<ObservableTraceStream>;
}

@Component({
    selector: 'plotly',
    template: ``,
    styles: [
            `
            :host {
                display: block;
            }

            :host >>> div.js-plotly-plot {
                min-width: 200px;
                min-height: 200px;
            }

            :host >>> svg text {
                font-family: 'Inter UI', Verdana, sans-serif !important;
            }

            :host >>> svg text {
                font-size: 11px !important;
            }

            :host >>> svg.main-svg {
                background-color: transparent !important;
            }

            :host >>> svg .bg {
                fill: transparent !important;
            }

            :host >>> svg .xaxislayer-above text,
            :host >>> svg .yaxislayer-above text {
                font-size: 10px !important;
            }

            :host-context(.dark) >>> svg text {
                fill: white !important;
            }

            :host-context(.dark) >>> svg .xgrid,
            :host-context(.dark) >>> svg .ygrid {
                stroke: rgba(146, 146, 146, 0.5) !important;
            }

            :host-context(.dark) >>> svg .js-line,
            :host-context(.dark) >>> svg .gridlayer > g {
                transition: all 0.2s ease-in;
            }

            :host-context(.dark) >>> svg .hovertext > rect {
                fill: black !important;
            }

            :host-context(.dark) >>> svg .hovertext > path {
                stroke: black !important;
            }
        `
    ]
})
export class PlotlyComponent {
    layoutPrepared: Partial<Layout> = {
        plot_bgcolor: 'transparent',
        height: 200,
        margin: {
            l: 35,
            r: 15,
            b: 35,
            t: 15,
        },
        xaxis: {
            gridcolor: '#d7ebf7',
            titlefont: {
                color: '#333333'
            }
        },
        yaxis: {
            tickmode: 'auto',
            // nticks: 10,
            gridcolor: '#dcf0fc',
            // tickmode: 'linear',
            // tick0: 0,
            // dtick: 1,
            titlefont: {
                color: '#333333'
            }
        },
    };

    @Input() layout: BehaviorSubject<Partial<Layout>> = new BehaviorSubject<Partial<Layout>>({});
    @Input() config: BehaviorSubject<Partial<Config>> = new BehaviorSubject<Partial<Config>>({
        responsive: true,
    });
    @Input() trace: Observable<ObservableTrace> = new Observable<ObservableTrace>();

    private resizeCallback: () => void;
    private container: HTMLElement;
    private plotly?: PlotlyHTMLElement;
    private destroyed = false;

    private data: Data[] = [];
    private dataMap: { [traceName: string]: Data } = {};

    @unsubscribe()
    private subs = new Subscriptions();

    constructor(private element: ElementRef) {
        this.container = this.element.nativeElement;

        this.resizeCallback = (): void => {
            Plots.resize(this.container);
        };

        window.addEventListener('resize', this.resizeCallback);
    }

    ngOnDestroy(): void {
        this.destroyed = true;

        if (this.plotly && this.container) {
            purge(this.container);
            delete this.plotly;
        }

        window.removeEventListener('resize', this.resizeCallback);
    }

    async ngOnChanges(changes: SimpleChanges) {
        //remove everything and start from new
        if (this.plotly) {
            purge(this.container);
            delete this.plotly;
        }

        // console.log('plotly ngOnChanges', changes);
        this.subs.unsubscribe();
        this.setLayout(this.layout.getValue());

        if (this.trace) {
            this.data = [];
            this.dataMap = {};

            this.subs.add = this.trace.subscribe((trace) => {
                this.subs.add = trace.data.subscribe(async (data) => {
                    if (this.dataMap[trace.name]) {
                        const index = this.data.indexOf(this.dataMap[trace.name]);
                        this.data[index] = data;
                    } else {
                        this.data.push(data);
                    }

                    this.dataMap[trace.name] = data;

                    if (this.plotly) {
                        // console.log('plotly react', trace.name);
                        await react(this.container, this.data, this.layoutPrepared, this.config.getValue());
                    }
                });

                this.subs.add = trace.stream.pipe(first()).subscribe((traceData) => {
                    this.addTraceDatas(trace, [traceData]);
                    this.subs.add = trace.stream.pipe(bufferTime(1000)).subscribe((traceDatas) => this.addTraceDatas(trace, traceDatas));
                });
            });
        }
    }

    private async addTraceDatas(trace: ObservableTrace, traceDatas: ObservableTraceStream[]) {
        if (!traceDatas.length || this.destroyed) return;

        const index = this.data.indexOf(this.dataMap[trace.name]);

        if (this.plotly) {
            const x = [];
            const y = [];
            for (const traceData of traceDatas) {
                x.push(...traceData.x);
                y.push(...traceData.y);
            }

            // console.log('extendTraces', trace.name, x, y);
            try {
                await extendTraces(this.container, {
                    x: [x],
                    y: [y]
                }, [index]);
            } catch (error) {
                console.error('Error extending trace', trace.name, x, y);
                console.error(error);
            }
        } else {
            this.data[index].x = [];
            this.data[index].y = [];
            for (const traceData of traceDatas) {
                (this.data[index].x as any[]).push(...traceData.x);
                (this.data[index].y as any[]).push(...traceData.y);
            }

            // console.log('newPlot', trace.name, this.data[index].x, this.data[index].y, this.layoutPrepared, this.config.getValue());
            this.plotly = await newPlot(this.container, this.data, this.layoutPrepared, this.config.getValue());
        }
    }

    private setLayout(layout: Partial<Layout>) {
        for (const [k, v] of eachPair(layout)) {
            setPathValue(this.layoutPrepared, k, v);
        }
    }
}
