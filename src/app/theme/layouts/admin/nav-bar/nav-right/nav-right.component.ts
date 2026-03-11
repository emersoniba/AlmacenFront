import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-nav-right',
    templateUrl: './nav-right.component.html',
    styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy{
    private subcription: Subscription | undefined;

    profile = [
        {
            icon: 'ti ti-edit-circle',
            title: 'Edit Profile'
        },
        {
            icon: 'ti ti-user',
            title: 'View Profile'
        },
        {
            icon: 'ti ti-clipboard',
            title: 'Social Profile'
        },
        {
            icon: 'ti ti-edit-circle',
            title: 'Billing'
        },
        {
            icon: 'ti ti-power',
            title: 'Logout'
        }
    ];

    setting = [
        {
            icon: 'ti ti-help',
            title: 'Support'
        },
        {
            icon: 'ti ti-user',
            title: 'Account Settings'
        },
        {
            icon: 'ti ti-lock',
            title: 'Privacy Center'
        },
        {
            icon: 'ti ti-messages',
            title: 'Feedback'
        },
        {
            icon: 'ti ti-list',
            title: 'History'
        }
    ];

    constructor(
        private authService: AuthService
    ){
    }

    ngOnInit(): void {
    }

    public logout(){
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.subcription?.unsubscribe();
    }
}
