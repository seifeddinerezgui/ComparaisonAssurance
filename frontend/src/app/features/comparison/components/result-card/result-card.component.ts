import { Component, Input, OnInit } from '@angular/core';
import { ComparisonResult } from '../../../../core/models/project.model';

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrls: ['./result-card.component.css']
})
export class ResultCardComponent implements OnInit {
  @Input() result!: ComparisonResult;
  @Input() projectName: string = '';
  showDetails = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getInsurerLogo(insurer: string): string {
    // In a real app, we would map the insurer name to their logo
    // For now, we'll use a placeholder
    return 'assets/images/insurers/' + insurer.toLowerCase() + '.png';
  }

  getInsurerColor(insurer: string): string {
    // Return different brand colors based on the insurer
    const colors: {[key: string]: string} = {
      'UTWIN': '#008fc9',
      'APRIL': '#e84c3d',
      'METLIFE': '#0066b3',
      'CARDIF': '#34b233'
    };
    
    return colors[insurer] || '#3498db';
  }
}