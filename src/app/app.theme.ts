import { AdminComponent } from "./theme/layouts/admin/admin.component";
import { NavBarComponent } from "./theme/layouts/admin/nav-bar/nav-bar.component";
import { NavLeftComponent } from "./theme/layouts/admin/nav-bar/nav-left/nav-left.component";
import { NavRightComponent } from "./theme/layouts/admin/nav-bar/nav-right/nav-right.component";
import { NavCollapseComponent } from "./theme/layouts/admin/navigation/nav-content/nav-collapse/nav-collapse.component";
import { NavContentComponent } from "./theme/layouts/admin/navigation/nav-content/nav-content.component";
import { NavGroupComponent } from "./theme/layouts/admin/navigation/nav-content/nav-group/nav-group.component";
import { NavItemComponent } from "./theme/layouts/admin/navigation/nav-content/nav-item/nav-item.component";
import { NavigationComponent } from "./theme/layouts/admin/navigation/navigation.component";
import { GuestComponent } from "./theme/layouts/guest/guest.component";

export const AppThemeConfig = [
    AdminComponent,
    GuestComponent,
    NavigationComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavContentComponent,
    NavCollapseComponent,
    NavGroupComponent,
    NavItemComponent
]
