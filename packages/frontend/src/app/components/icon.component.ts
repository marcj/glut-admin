import {Component, HostBinding, Input} from "@angular/core";

@Component({
    selector: 'dk-icon',
    template: `{{name}}`,
    styles: [`
    :host {
        vertical-align: middle;
    }`]
})
export class IconComponent {
    @Input() name!: string;

    @Input() size: number = 18;

    @HostBinding('style.width')
    get width() {
        return this.size + 'px';
    }
    @HostBinding('style.font-size')
    get fontSize() {
        return (this.size) + 'px';
    }
}
