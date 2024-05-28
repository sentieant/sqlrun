import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  templateUrl: './sql-editor.component.html',
  imports: [CommonModule],
  styleUrls: ['./sql-editor.component.css']
})
export class SqlEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  public results: any;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window !== 'undefined') {
      const ace = await import('ace-builds');

      ace.config.set('fontSize', '14px');
      ace.config.set(
        'basePath',
        'https://unpkg.com/ace-builds@1.4.12/src-noconflict'
      );
      const aceEditor = ace.edit(this.editor.nativeElement);
      aceEditor.setTheme('ace/theme/twilight');
      aceEditor.session.setMode('ace/mode/sql');
    }
  }

  runQuery() {
    if (typeof window !== 'undefined') {
      const ace = (window as any).ace;
      const sqlQuery = ace.edit(this.editor.nativeElement).getValue();
      const token = this.authService.getToken();

      this.http
          .post<any>('http://localhost:3000/api/query', { sql: sqlQuery }, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          })
          .subscribe(
              (data) => {
                  this.results = JSON.stringify(data, null, 2); // Format results as JSON
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
                  this.results = { error: error.message };
              }
          );
    }
  }
}
