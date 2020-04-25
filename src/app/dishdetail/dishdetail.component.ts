import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Comment} from '../shared/comment';
import { Dish } from '../shared/dish';

import { DishService } from '../services/dish.service';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  dish :Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment : Comment;
  commentbackForm: FormGroup;
  commentback: Comment;

  @ViewChild('fform' ) commentbackFormDirective;
  
  formErrors = {
    'author': '',
    'comment': '',
  };

  validationMessages = {
    'author': {
      'required': 'Author name is required.',
      'minlength': 'Author name must be at leat 2 characrters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  }

  
  constructor(private dishService : DishService,
    private route : ActivatedRoute,
    private location: Location , 
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
      this.createForm();
    }

  createForm(){
      this.commentbackForm = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2)]],
        comment: ['', [Validators.required]],
        rating: ['5',[Validators.required]]
      });
      this.commentbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
      this.onValueChanged(); // reset form validation messages
    }
  onValueChanged(data?: any){
      if (!this.commentbackForm) {return;}
      const form = this.commentbackForm;
      for (const field in this.formErrors){
        if (this.formErrors.hasOwnProperty(field)){
          //clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid){
            const messages = this.validationMessages[field];
            for (const key in control.errors){
              if (control.errors.hasOwnProperty(key)){
                this.formErrors[field] += messages[key]+ '';
              }
          }
        }
      }
    }
  }
onSubmit(){

  this.comment = this.commentbackForm.value;
    let dt = new Date();
    this.comment.date = dt.toISOString();
    this.dish.comments.push(this.comment);
    this.commentbackForm.reset({
      author: '',
      comment: '',
      rating: '5'
    });
    
}
  ngOnInit() {
    this.dishService.getDishIds()
    .subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
    .pipe(switchMap((params: Params)=> this.dishService.getDish(params['id'])))
    .subscribe( dish => {this.dish = dish ; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishId: string){
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length ] ;
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length ] ;
  }

  goBack(): void{
    this.location.back();
  }
}
