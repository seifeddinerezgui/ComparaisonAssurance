import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.setupMenu();
  }

  setupMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/']
      },
      {
        label: 'Leads',
        icon: 'pi pi-users',
        routerLink: ['/leads']
      },
      {
        label: 'Projects',
        icon: 'pi pi-briefcase',
        routerLink: ['/projects']
      },
      {
        label: 'Comparisons',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'All Projects',
            icon: 'pi pi-list',
            routerLink: ['/projects']
          },
          {
            label: 'Create New',
            icon: 'pi pi-plus',
            command: () => {
              this.router.navigate(['/projects'], {
                state: { createProject: true }
              });
            }
          }
        ]
      }
    ];
  }

  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
