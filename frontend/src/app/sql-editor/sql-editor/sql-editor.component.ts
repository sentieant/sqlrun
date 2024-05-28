import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: "app-sql-editor",
  templateUrl: "./sql-editor.component.html",
  styleUrls: ["./sql-editor.component.css"]
})
export class SqlEditorComponent implements AfterViewInit {
  @ViewChild("editor") private editor!: ElementRef<HTMLElement>; 

  private results: any;

  constructor(private http: HttpClient, private authService: AuthService) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window !== 'undefined') {
      const ace = await import("ace-builds");

      ace.config.set("fontSize", "14px");
      ace.config.set(
        "basePath",
        "https://unpkg.com/ace-builds@1.4.12/src-noconflict"
      );
      const aceEditor = ace.edit(this.editor.nativeElement);
      aceEditor.setTheme("ace/theme/twilight");
      aceEditor.session.setMode("ace/mode/sql");
    }
  }

  runQuery() {
    if (typeof window !== 'undefined') {
      const ace = (window as any).ace;
      const sqlQuery = ace.edit(this.editor.nativeElement).getValue();
      this.http.post<any>('api/query', { sql: sqlQuery }, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      }).subscribe(
        (data) => {
          this.results = data;
          alert('Query Executed!');
        },
        (error) => {
          console.error('Error executing query:', error);
          this.results = { error: error.message };
        }
      );
    }
  }
}
