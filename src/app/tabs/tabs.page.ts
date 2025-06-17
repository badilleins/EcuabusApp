import { Component, OnInit } from '@angular/core';
import { AuthService } from '../login/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
      this.authService.getCurrentUser().subscribe();
  }
  showTabs():boolean{
    return this.authService.isClienteOrTaquillero();
  }
}
