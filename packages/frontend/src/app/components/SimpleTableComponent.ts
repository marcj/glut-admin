import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    EventEmitter,
    HostBinding, HostListener,
    Input,
    OnChanges, OnDestroy,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef, ViewChild,
} from '@angular/core';
import {
    arrayHasItem,
    arrayRemoveItem,
    empty,
    first,
    isNumber,
    indexOf
} from '@marcj/estdlib';

import {
    Collection,
    IdInterface,
} from '@marcj/glut-core';

import {
    Subscriptions
} from '@marcj/estdlib-rxjs';

import {unsubscribe} from "../reactivate-change-detection";
import {Subscription} from "rxjs";

export interface Column<T> {
    id: string;
    header?: string;
    cell?: (row: T) => string;
}

@Directive({
    selector: '[simpleTableCell]',
})
export class SimpleTableCellDirective {
    constructor(public template: TemplateRef<any>) {
    }
}

@Directive({
    selector: 'simple-table-column'
})
export class SimpleTableColumnDirective {
    @Input('name') name?: string;
    @Input('header') header?: string;
    @Input('width') width?: number | string;
    @Input('class') class: string = '';

    @ContentChild(SimpleTableCellDirective) cell?: SimpleTableCellDirective;

    getWidth(): string | undefined {
        if (!this.width) return undefined;

        if (isNumber(this.width)) {
            return this.width + 'px';
        }

        return this.width;
    }
}

@Component({
    selector: 'simple-table-header',
    template: '<ng-template #templateref><ng-content></ng-content></ng-template>'

})
export class SimpleTableHeaderDirective implements AfterViewInit {
    @Input('name') name!: string;
    @Input('sortable') sortable: boolean = true;

    @ViewChild('templateref') template!: TemplateRef<any>;

    ngAfterViewInit(): void {
    }
}

@Component({
    selector: 'simple-table',
    template: `
        <table class="pretty">
            <thead>
                <tr>
                    <th *ngFor="let column of columnDefs" 
                    [style.width]="column.getWidth()"
                    (click)="sortBy(column.name)"
                    >
                        <ng-container
                            *ngIf="headerMapDef[column.name]"
                            [ngTemplateOutlet]="headerMapDef[column.name].template"
                            [ngTemplateOutletContext]="{$implicit: column}"></ng-container>
                    {{column.header || column.name}}
                    <img 
                     *ngIf="(currentSort || defaultSort) === column.name"
                    class="sort-arrow"
                    [class.asc]="(currentSortDirection || defaultSortDirection) === 'asc'" 
                    src="assets/images/arrow.svg"/>
                    </th>
                </tr>
            </thead>
            <tbody>
                <ng-container *ngFor="let row of sorted; trackBy: trackByFn">
                    <tr
                        [ngClass]="{'selected dark': selectedMap[row.id]}" 
                        [id]="'simple_table_item_' + row.id" 
                        (click)="select(row, $event)"
                        (dblclick)="dbclick.emit(row)"
                    >
                        <td *ngFor="let column of columnDefs"
                            [class]="column.class">
                            <ng-container *ngIf="column.cell">
                                <ng-container [ngTemplateOutlet]="column.cell.template"
                                              [ngTemplateOutletContext]="{ $implicit: row }"></ng-container>
                            </ng-container>
                            <ng-container *ngIf="!column.cell">
                                {{ row[column.name] }}
                            </ng-container>
                        </td>
                    </tr>
                </ng-container>
            </tbody>
        </table>
    `,
    styles: [`
        :host {
            display: block;
            min-height: 250px;
            min-width: 350px;
        }

        :host:focus {
            outline: 0;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent<T extends IdInterface> implements AfterViewInit, OnChanges, OnDestroy {
    @HostBinding() tabindex = 0;

    @Input() public items!: T[] | Collection<T>;

    @Input() public defaultSort: string = '';
    @Input() public defaultSortDirection: 'asc' | 'desc' = 'asc';
    @Input() public selectable: boolean = false;
    @Input() public multiSelect: boolean = false;
    @Input() public trackFn?: (index: number, item: T) => any;

    @Input() public displayInitial: number = 20;
    @Input() public increaseBy: number = 10;
    @Input() public filter?: (item: T) => boolean;
    @Input() public filterQuery?: string;
    @Input() public filterFields?: string[];

    public currentSort: string = '';
    public currentSortDirection: 'asc' | 'desc' | '' = '';

    public sorted: T[] = [];

    public selectedMap: {[id: string]: T} = {};
    @Input() public selected: T[] = [];
    @Output() public selectedChange: EventEmitter<T[]> = new EventEmitter();
    @Output() public dbclick: EventEmitter<T> = new EventEmitter();

    @ContentChildren(SimpleTableColumnDirective) columnDefs?: QueryList<SimpleTableColumnDirective>;
    @ContentChildren(SimpleTableHeaderDirective) headerDefs?: QueryList<SimpleTableHeaderDirective>;
    headerMapDef: {[name: string]: SimpleTableHeaderDirective} = {};

    public displayedColumns?: string[] = [];

    @unsubscribe()
    private directiveSubscriptions = new Subscriptions;

    @unsubscribe()
    private dataSubscriptions = new Subscriptions;

    @unsubscribe()
    private itemsSubscription?: Subscription;

    constructor(private cd: ChangeDetectorRef) {
    }

    onScroll() {
        // console.log('onScroll');
    }

    ngOnDestroy(): void {
    }

    public sortBy(name: string) {

        if (this.headerMapDef[name]) {
            const headerDef = this.headerMapDef[name];
            if (!headerDef.sortable) {
                return;
            }
        }

        if (!this.currentSort && this.defaultSort === name) {
            this.currentSort = this.defaultSort;
            this.currentSortDirection = this.defaultSortDirection;

            if (this.currentSortDirection === 'asc') {
                this.currentSortDirection = 'desc';
            } else {
                this.currentSortDirection = 'asc';
            }
        } else if (this.currentSort === name) {
            if (this.currentSortDirection === 'asc') {
                this.currentSortDirection = 'desc';
            } else {
                this.currentSortDirection = 'asc';
            }
        } else if (!this.currentSort && this.defaultSort !== name) {
            this.currentSort = this.defaultSort;
            this.currentSortDirection = this.defaultSortDirection;
        }

        // if (this.currentSort !== name) {
        //     this.currentSort = this.defaultSort;
        //     this.currentSortDirection = this.defaultSortDirection;
        // } else {
        //     if (this.currentSortDirection === '') {
        //         this.currentSortDirection = this.defaultSortDirection;
        //     }
        //     if (this.currentSortDirection === 'asc') {
        //         this.currentSortDirection = 'desc';
        //     } else {
        //         this.currentSortDirection = 'asc';
        //     }
        // }

        this.currentSort = name;
        this.doSort();
    }

    trackByFn(index: number, item: any) {
        return this.trackFn ? this.trackFn(index, item) : index;
    }

    ngAfterViewInit() {
        if (this.columnDefs) {
            if (this.headerDefs) {
                for (const header of this.headerDefs.toArray()) {
                    this.headerMapDef[header.name] = header;
                }
            }
            this.directiveSubscriptions.add = this.columnDefs.changes.subscribe(() => {
                this.updateDisplayColumns();
            });
            this.updateDisplayColumns();
        }
    }

    filterFn(item: T) {
        if (this.filter) {
            return this.filter(item);
        }

        if (this.filterQuery && this.filterFields) {
            const q = this.filterQuery.toLowerCase();
            for (const field of this.filterFields) {
                if (-1 !== String((item as any)[field]).toLowerCase().indexOf(q)) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.items) {
            this.dataSubscriptions.unsubscribe();

            if (this.items instanceof Collection) {
                this.dataSubscriptions.add = this.items.subscribe((items) => {
                    this.sorted = items;
                    this.doSort();
                });

                this.dataSubscriptions.add = this.items.event.subscribe((event) => {
                    if (event.type === 'remove') {
                        if (this.selectedMap[event.id]) {
                            arrayRemoveItem(this.selected, this.selectedMap[event.id]);
                            delete this.selectedMap[event.id];
                        }
                    }
                });

                this.sorted = this.items.all();
                this.doSort();
            } else {
                this.sorted = this.items;
                this.doSort();
            }
        }

        if (changes.selected) {
            this.selectedMap = {};
            if (this.selected) {
                for (const v of this.selected) {
                    this.selectedMap[v.id] = v;
                }
            }
        }
    }

    private updateDisplayColumns() {
        this.displayedColumns = [];

        if (this.columnDefs) {
            for (const column of this.columnDefs.toArray()) {
                this.displayedColumns.push(column.name!);
            }

            this.doSort();
        }
    }

    private doSort() {
        if (!this.sorted) {
            return;
        }

        this.sorted.sort((a: any, b: any) => {
            if ((this.currentSortDirection || this.defaultSortDirection) === 'asc') {
                if (a[this.currentSort || this.defaultSort] > b[this.currentSort || this.defaultSort]) return 1;
                if (a[this.currentSort || this.defaultSort] < b[this.currentSort || this.defaultSort]) return -1;
            } else {
                if (a[this.currentSort || this.defaultSort] > b[this.currentSort || this.defaultSort]) return -1;
                if (a[this.currentSort || this.defaultSort] < b[this.currentSort || this.defaultSort]) return 1;
            }

            return 0;
        });

        //apply filter
        this.sorted = this.sorted.filter((v) => this.filterFn(v));

        this.cd.detectChanges();
    }

    @HostListener('keydown', ['$event'])
    onFocus(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const firstSelected = first(this.selected);
            if (firstSelected) {
                this.dbclick.emit(firstSelected);
            }
        }

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            const firstSelected = first(this.selected);

            if (!firstSelected) {
                this.select(this.sorted[0]);
                return;
            }

            let index = indexOf(this.sorted, firstSelected);

            // if (-1 === index) {
            //     this.select(this.sorted[0]);
            //     this.paginator.pageIndex = 0;
            //     return;
            // }

            if (event.key === 'ArrowUp') {
                if (0 === index) {
                    return;
                }
                index--;
            }

            if (event.key === 'ArrowDown') {
                // if (empty(this.items)) {
                //     return;
                // }
                index++;
            }

            if (this.sorted[index]) {
                const item = this.sorted[index];
                // if (event.shiftKey) {
                //     this.selectedMap[item.id] = true;
                //     this.selected.push(item);
                // } else {
                    this.select(item);
                // }
            }
            this.selectedChange.emit(this.selected);

            // const nextJob = this.jobs.all()[index];
            // this.paginator.pageIndex = this.jobs.getPageOf(nextJob);
            // this.dataSource.next();
            // this.select(nextJob);
        }
    }

    private select(item: T, $event?: MouseEvent) {
        if (!this.selectable) {
            return;
        }

        if (!this.multiSelect) {
            this.selected = [item];
            this.selectedMap = {};
            this.selectedMap[item.id] = item;
        } else {
            if (!$event || !$event.metaKey) {
                this.selected = [item];
                this.selectedMap = {};
                this.selectedMap[item.id] = item;
            } else {
                if (arrayHasItem(this.selected, item)) {
                    arrayRemoveItem(this.selected, item);
                    delete this.selectedMap[item.id];
                } else {
                    this.selectedMap[item.id] = item;
                    this.selected.push(item);
                }
            }
        }
        this.selectedChange.emit(this.selected);

        // setTimeout(() => {
        //     scrollIntoView(document.getElementById('simple_table_item_' + (item as any)['id']), {
        //         scrollMode: 'if-needed'
        //     });
        // }, 50);
    }
}
