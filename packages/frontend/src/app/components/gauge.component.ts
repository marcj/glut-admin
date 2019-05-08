import {Component, Input} from "@angular/core";

@Component({
    selector: 'dk-gauge',
    template: `
        <svg height="54" width="54" viewBox="0 0 54 54">
            <circle class="bg" cx="27" cy="27" r="26" />
            <circle class="fg" cx="27" cy="27" r="26"
                    *ngIf="total > 0 && current > 0"
                    [attr.stroke-dashoffset]="160 - (160 * (current/total))"
            />
        </svg>
        <div class="label">{{label}}</div>
        <div class="text">
            {{current}}/{{total}}<br/>
            {{affix}}
        </div>
    `,
    styles: [`
        :host {
            display: inline-block;
            position: relative;
            text-align: center;
            font-size: 11px;
            margin: 0 5px;
            color: var(--text-gray);
        }

        .label {
            position: absolute;
            top: 21px;
            text-align: center;
            left: 5px;
            right: 5px;
        }

        .text {
            margin-top: 5px;
        }

        svg {
            margin: auto;
        }

        svg circle.bg {
            fill: transparent;
            stroke: #E6E6E6;
            stroke-width: 1;
        }

        svg circle.fg {
            fill: transparent;
            stroke: #125582;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            stroke-width: 2;
            stroke-dasharray: 160;
        }
    `]
})
export class GaugeComponent {
    @Input() current: number = 0;

    @Input() total: number = 0;

    @Input() label: string = '';

    @Input() affix: string = '';
}
