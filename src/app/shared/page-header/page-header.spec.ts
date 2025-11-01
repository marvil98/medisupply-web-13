import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let component: PageHeader;
  let fixture: ComponentFixture<PageHeader>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleMenu', () => {
    it('should toggle menuVisible from false to true', () => {
      expect(component.menuVisible).toBe(false);
      component.toggleMenu();
      expect(component.menuVisible).toBe(true);
    });

    it('should toggle menuVisible from true to false', () => {
      component.menuVisible = true;
      component.toggleMenu();
      expect(component.menuVisible).toBe(false);
    });

    it('should toggle menuVisible multiple times', () => {
      expect(component.menuVisible).toBe(false);
      component.toggleMenu();
      expect(component.menuVisible).toBe(true);
      component.toggleMenu();
      expect(component.menuVisible).toBe(false);
      component.toggleMenu();
      expect(component.menuVisible).toBe(true);
    });
  });

  describe('logout', () => {
    it('should call logout without errors', () => {
      expect(() => component.logout()).not.toThrow();
    });
  });

  describe('goBack', () => {
    it('should navigate when backRoute is set', () => {
      component.backRoute = '/previous-page';
      component.goBack();
      
      expect(router.navigate).toHaveBeenCalledWith(['/previous-page']);
    });

    it('should not navigate when backRoute is null', () => {
      component.backRoute = null;
      component.goBack();
      
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when backRoute is empty string', () => {
      component.backRoute = '';
      component.goBack();
      
      // Empty string is falsy, so navigation should not happen
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Inputs', () => {
    it('should have default values', () => {
      expect(component.pageTitle).toBe('');
      expect(component.userName).toBe('John Doe');
      expect(component.userRole).toBe('Administrador');
      expect(component.backRoute).toBeNull();
    });

    it('should accept custom inputs', () => {
      component.pageTitle = 'Test Page';
      component.userName = 'Test User';
      component.userRole = 'Manager';
      component.backRoute = '/test';
      
      expect(component.pageTitle).toBe('Test Page');
      expect(component.userName).toBe('Test User');
      expect(component.userRole).toBe('Manager');
      expect(component.backRoute).toBe('/test');
    });
  });
});

