import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-nav-left',
    templateUrl: './nav-left.component.html',
    styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnInit{
    @Input() navCollapsed: boolean;
    @Output() NavCollapse = new EventEmitter();
    @Output() NavCollapsedMob = new EventEmitter();
    windowWidth = window.innerWidth;

    public formBuscar: FormGroup;

    constructor(
        private fb: FormBuilder
    ){
        this.formBuscar = new FormGroup({});
    }

    ngOnInit(){
        this.getFormBuilder();
    }

    getFormBuilder(){
        this.formBuscar = this.fb.group({
            buscar: ['', []]
        });
    }

    buscar(){

    }

    navCollapse() {
        this.NavCollapse.emit();
    }
}
