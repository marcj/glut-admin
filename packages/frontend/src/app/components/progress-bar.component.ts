import {Component, Input} from "@angular/core";

@Component({
    selector: 'dk-progress-bar',
    template: `
        <div class="active" [style.width]="v"></div>
    `,
    styles: [`
        :host {
            position: relative;
            display: inline-block;
            width: 100px;
            height: 22px;
            vertical-align: middle;

            background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 50%, transparent 50%);
            background-size: 2px;
            background-repeat: repeat;
        }

        .active {
            position: absolute;
            top: 0;
            height: 100%;
            left: 0;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 50%, transparent 50%);
            background-size: 2px;
            background-repeat: repeat;
            transition: width 0.5s ease-in;
        }

        :host-context(.light) {
            background-image: linear-gradient(90deg, rgba(50, 50, 50, 0.2) 50%, transparent 50%) !important;
        }

        :host-context(.light) .active {
            background-image: linear-gradient(90deg, rgba(50, 50, 50, 0.6) 50%, transparent 50%) !important;
        }
    `]
})
export class ProgressBarComponent {
    @Input() value: number = 0;

    get v() {
        return Math.min((this.value || 0) * 100, 100).toFixed(0) + '%';
    }

}
