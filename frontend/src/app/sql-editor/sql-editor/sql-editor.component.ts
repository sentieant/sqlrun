import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.css']
})
export class SqlEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;

  private results: any;

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
      console.log('Token:', token); // Log the token for debugging

      this.http
        .post<any>('api/query', { sql: sqlQuery }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .subscribe(
          (data) => {
            this.results = data;
            alert('Query Executed!');
          },
          (error: HttpErrorResponse) => {
            if (error.status === 403) {
              alert('Authentication failed. Please log in again.');
            } else if (error.status === 401) {
              alert('Unauthorized access. Please check your permissions.');
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
