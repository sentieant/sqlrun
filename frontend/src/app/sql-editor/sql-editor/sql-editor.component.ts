import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  templateUrl: './sql-editor.component.html',
  imports: [CommonModule],
  styleUrls: ['./sql-editor.component.css']
})
export class SqlEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  public results: any[] = [];
  public tableKeys: string[] = [];
  public userPoints: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window !== 'undefined') {
      const ace = await import('ace-builds');
      ace.config.set('fontSize', '14px');
      ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
      const aceEditor = ace.edit(this.editor.nativeElement);
      aceEditor.setTheme('ace/theme/twilight');
      aceEditor.session.setMode('ace/mode/sql');
    }
    this.fetchUserPoints();
  }

  fetchUserPoints() {
    const token = this.authService.getToken();
    this.http.get<any>(environment.apiUrl + '/user/points', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe(
      data => {
        if (data && data.points !== undefined) {
          this.userPoints = data.points;
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching user points:', error);
        this.userPoints = null;
      }
    );
  }

  viewPoints() {
    alert(`Current Points: ${this.userPoints !== null ? this.userPoints : 'N/A'}`);
  }

  runQuery() {
    if (typeof window !== 'undefined') {
      const ace = (window as any).ace;
      const sqlQuery = ace.edit(this.editor.nativeElement).getValue();
      const token = this.authService.getToken();

      this.http
        .post<any>(environment.apiUrl + '/query', { sql: sqlQuery }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe(
          (data) => {
            if (data && data.results) {
              this.results = data.results;
              this.tableKeys = Object.keys(data.results[0]);
              if (data.pointsAwarded !== undefined) {
                this.userPoints = data.currentPoints;
              }
              if (data.teamWon) {
                alert('The team won! Points have been updated to 1000.');
                this.userPoints = 1000;
              }
            } else {
              this.results = [];
              this.tableKeys = [];
            }
            alert('Query Executed!');
          },
          (error: HttpErrorResponse) => {
            if (error.status === 403) {
              alert('Authentication failed. Please log in again.');
            } else if (error.status === 401) {
              alert('Unauthorized access. Please check your permissions.');
            } else if (error.status === 500) {
              console.error('Server error details:', error.error.details);
              alert('An error occurred while executing the query.');
            } else {
              console.error('Error executing query:', error);
              alert('An error occurred while executing the query.');
            }
            this.results = [{ error: error.message }];
            this.tableKeys = [];
          }
        );
    }
  }
}
