import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ChartModule } from 'primeng/chart';

// App Routing and Component
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Core Services and Interceptors
import { TokenInterceptor } from './core/auth/token.interceptor';

// Feature Components
import { LoginComponent } from './features/auth/login/login.component';
import { HubspotCallbackComponent } from './features/auth/hubspot-callback/hubspot-callback.component';
import { LeadListComponent } from './features/leads/lead-list/lead-list.component';
import { LeadDetailComponent } from './features/leads/lead-detail/lead-detail.component';
import { LeadFormComponent } from './features/leads/lead-form/lead-form.component';
import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { ProjectDetailComponent } from './features/projects/project-detail/project-detail.component';
import { ComparisonFormComponent } from './features/comparison/comparison-form/comparison-form.component';
import { ComparisonResultsComponent } from './features/comparison/comparison-results/comparison-results.component';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HubspotCallbackComponent,
    LeadListComponent,
    LeadDetailComponent,
    LeadFormComponent,
    ProjectListComponent,
    ProjectDetailComponent,
    ComparisonFormComponent,
    ComparisonResultsComponent,
    NavbarComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // PrimeNG Modules
    ButtonModule,
    CardModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MenuModule,
    MenubarModule,
    MessageModule,
    MessagesModule,
    PanelModule,
    ProgressSpinnerModule,
    TableModule,
    TabViewModule,
    ToastModule,
    ToolbarModule,
    CalendarModule,
    InputNumberModule,
    RadioButtonModule,
    ChartModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
