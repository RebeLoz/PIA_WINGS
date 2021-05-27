import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlatilloPage } from './platillo.page';

describe('PlatilloPage', () => {
  let component: PlatilloPage;
  let fixture: ComponentFixture<PlatilloPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlatilloPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlatilloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
