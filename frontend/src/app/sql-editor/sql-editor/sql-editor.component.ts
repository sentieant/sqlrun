import { Component, OnInit } from '@angular/core';
import * as ace from 'ace-builds';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  imports: [],
  templateUrl: './sql-editor.component.html',
  styleUrl: './sql-editor.component.css'
})
export class SqlEditorComponent implements OnInit {
  private editor!: ace.Ace.Editor;
  private results: any;
  private points!: number;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/monokai');
    this.editor.session.setMode('ace/mode/sql');
  }

  runQuery() {
    const sqlQuery = this.editor.getValue();
    this.http.post<any>('api/query', {sql: sqlQuery}, {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe(
      data => {
        this.results = data;
        alert('Query Executed!');
      },
      error => {
        this.results = {error : error.message};
      }
      );
  }
}
