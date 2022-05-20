import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from '../api-services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formGroup: FormGroup;
  constructor(private router: Router, private service: LoginService) {
    this.formGroup = new FormGroup({});
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  login() {
    if (this.formGroup.valid) {
      this.service.authenticateUser(this.formGroup.value).subscribe((res) => {
        if (res.message == "success") {
          console.log(res);

          localStorage.setItem('username', res.data.User_UserName);
          localStorage.setItem('user_role', res.data.Role_Name);
          this.router.navigate(['dashboard']);
        } else {
          alert("Login Failed;");
        }
      }, error => {
        alert("Login Failed;");
      });
    }
  }


}
