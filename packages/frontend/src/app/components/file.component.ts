import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Buffer} from "buffer";
import {ReactiveChangeDetectionModule} from "../reactivate-change-detection";

@Component({
    selector: 'dk-file',
    template: `
        <input type="file" (change)="handleFileInput($event.target.files)" />
    `
})
export class FileComponent {
    @Input() model: Buffer | undefined;

    @Output() modelChange = new EventEmitter<Buffer | undefined>();

    constructor() {
    }

    public handleFileInput(files: FileList) {
        const readFont = (file: File) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.result) {
                    if (reader.result instanceof ArrayBuffer) {
                        this.modelChange.next(Buffer.from(reader.result));
                        ReactiveChangeDetectionModule.tick();
                    }
                }

            };
            reader.onerror = (error) => {
                console.log('Error: ', error);
            };

            reader.readAsArrayBuffer(file);
        };

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (file) {
                readFont(file);
            }
        }
    }

}
