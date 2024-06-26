import { Component, OnInit  } from '@angular/core';
import { CalendarDay } from './calendar-day-model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileService } from '../fileService/file-service';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers:[FileService],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {

  constructor(private fileService: FileService) {}

  // page elements
  selectedMonth: any = ""; // value of months dropdown (start date)
  selectedYear: any = ""; // value of year input field (start date)
  customDate: any = ""; // value of selected date (calendar)
  showCalendar: boolean = false; 

  // variables that shows if error message is visible
  isMonthErrorVisible: boolean = false;
  isYearErrorVisible: boolean = false;
  isCustomDateErrorVisible: boolean = false;
  
  // global variables initialization
  daysInWeek = ["Monday", "Tuesday", "WednesDay", "Thursday", "Friday", "Saturday", "Sunday"];
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; 
  numberOfShownDaysInCalendar = 42;

  // variables used for determining the day of the week
  dayCodes = [1, 2, 3, 4, 5, 6, 0];
  monthCodes = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5]
  centuryCodes = [4, 2, 0, 6, 4, 2, 0] // from 1700s to 2300s

  // arrays that have values of permanent and variable holidays
  permanentHolidays: string[] = [];
  variableHolidays: string[] = [];

  // arrays that have data for cells displayed in calendar
  calendarDays = new Array<CalendarDay>(); // all calendar days
  calendarDaysByWeek: CalendarDay[][] = []; // all calendar days separated by week

  // variables that hold information about the month and year of the displayed month in the calendar 
  currentCalendarMonth: number = -1;
  currentCalendarYear: number = -1;
  calendarHeadMonth: string = "";
  calendarHeadYear: string = "";

  // variables that hold information about the date that the user type in custom date field
  customSelectedDay: number = -1;
  customSelectedMonth: number = -1;
  customSelectedYear: number = -1;

  // returns true if is a leap year, otherwise returns false
  IsLeapYear(year: number): boolean {
    return year % 4 == 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  // returns leap year code (need for calculating day of the week from date)
  // if is leap year and month is january or february returns 1, otherwise returns 0
  GetLeapYearCode(month: number, year: number): number {
    if (this.IsLeapYear(year) && (month == 1 || month == 2)) return 1;
    return 0;
  }

  // returns month code (need for calculating day of the week from date)
  GetMonthCode(month: number): number {
    return this.monthCodes[month - 1];
  }

  // returns year code (need for calculating day of the week from date)
  GetYearCode(year: number): number {
    var lastTwoDigits = year % 100;
    return (Math.floor(lastTwoDigits / 4) + lastTwoDigits) % 7;
  }

  // returns century code (need for calculating day of the week from date)
  GetCenturyCode(year: number): number {
    if (year >= 1700 && year <1800) return this.centuryCodes[0];
    if (year >= 1800 && year <1900) return this.centuryCodes[1];
    if (year >= 1900 && year <2000) return this.centuryCodes[2];
    if (year >= 2000 && year <2100) return this.centuryCodes[3];
    if (year >= 2100 && year <2200) return this.centuryCodes[4];
    if (year >= 2200 && year <2300) return this.centuryCodes[5];
    if (year >= 2300 && year <2400) return this.centuryCodes[6];
    return -1;
  }

  // returns index of day in the week for given date
  // returns values from 0 to 6
  GetDayIndexInWeek(day: number, month: number, year: number): number {
    var dayCodeIndex = (this.GetYearCode(year) + this.GetMonthCode(month) + this.GetCenturyCode(year) + day - this.GetLeapYearCode(month, year)) % 7;
    var dayIndex = this.dayCodes.indexOf(dayCodeIndex);
    return dayIndex;
  }

  // add all days from previous month that should be displayed in the calendar in the array
  GetPreviousMonthDaysCalendar(month: number, year: number, leapYear: boolean): void {
    var firstDayInMonthWeekIndex = this.GetDayIndexInWeek(1, month, year);
    // if is not monday => add days from previous month
    if (firstDayInMonthWeekIndex != 0) {
      var previousMonth = month - 1 == 0 ? 12 : month - 1; 
      var previousMonthYear = month - 1 == 0 ? year - 1 : year;
      var previousMonthNumberOfDays = this.daysInMonth[previousMonth - 1];
      if (previousMonth == 2 && leapYear) {
        previousMonthNumberOfDays += 1;
      } 
      var currentDateDay = previousMonthNumberOfDays - firstDayInMonthWeekIndex + 1;
      for(var i = currentDateDay; i <= previousMonthNumberOfDays; i++) {
        var calendarDay: CalendarDay = {
          day: i,
          month: previousMonth,
          year: previousMonthYear,
          isSunday: false,
          isHoliday: this.IsHoliday(i, previousMonth, previousMonthYear),
          isInCurrentMonth: false,
          isSelectedDate: false
        };
        this.calendarDays.push(calendarDay);
      }
    }
  }

  // add all days from current month that should be displayed in the calendar in the array
  GetCurrentMonthDaysCalendar(month: number, year: number, leapYear: boolean): void {
    var daysInMonth = this.daysInMonth[month - 1];
    if (month == 2 && leapYear) {
      daysInMonth += 1;
    } 
    for (var i = 1; i <= daysInMonth; i++) {
      var calendarDay: CalendarDay = {
        day: i,
        month: month,
        year: year,
        isSunday: false,
        isHoliday: this.IsHoliday(i,  month, year),
        isInCurrentMonth: true,
        isSelectedDate: this.customSelectedDay == i && this.customSelectedMonth == month && this.customSelectedYear == year
      };
      this.calendarDays.push(calendarDay);
    }
  }

  // add all days from next month that should be displayed in the calendar in the array
  GetNextMonthDaysCalendar(month: number, year: number): void {
    var nextMonth = month + 1 == 13 ? 1 : month + 1;
    var nextMonthYear = month + 1 == 13 ? year + 1 : year;
    var numberOfDaysThatNeedToAdd = this.numberOfShownDaysInCalendar - this.calendarDays.length;
    for (var i = 1; i <= numberOfDaysThatNeedToAdd; i++) {
      var calendarDay: CalendarDay = {
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isSunday: false,
        isHoliday: this.IsHoliday(i, nextMonth, nextMonthYear),
        isInCurrentMonth: false,
        isSelectedDate: false
      };
      this.calendarDays.push(calendarDay);
    }
  }

  // separates the days that must appear in the calendar by weeks
  GetMonthDaysByWeek() {
    for(var i = 0; i < 6; i++) {
      this.calendarDaysByWeek[i] = [];
      for(var j=0; j < 7; j++){
        this.calendarDaysByWeek[i].push(this.calendarDays[i*7+j]);
        if (j == 6) {
          this.calendarDaysByWeek[i][6].isSunday = true;
        }
      }
    }
  }

  // reads holidays from file and put them in arrays
  async ReadHolidaysFromFile() { 
    var textFile = "";
    await this.fileService.readFile().then((response: any) => {
      textFile = response;
    });
    var lines = textFile.split('\n'); 
    for(var i = 0; i < lines.length; i++) {
      var data = lines[i].split(".");
      // holiday is on same date every year
      if (data.length == 2) {
        this.permanentHolidays.push(lines[i].trimEnd());
      }
      // holiday is on different date
      else {
        this.variableHolidays.push(lines[i].trimEnd());
      }
    }
  }

  // returns true if the given date is holiday, otherwise returns false
  IsHoliday(day: number, month: number, year: number) {
    var dayString = day <= 9 ? "0" + day.toString() : day.toString();
    var monthString = month <= 9 ? "0" + month.toString() : month.toString();
    var dayAndMonthString = dayString + "." + monthString;
    var fullDateString = dayString + "." + monthString + "." + year.toString();
    return this.permanentHolidays.includes(dayAndMonthString) || this.variableHolidays.includes(fullDateString);
  }

  // set all days that need to be displayed in calendar
  GetSelectedMonthDays(month: number, year: number) {
    this.calendarDays = new Array<CalendarDay>();
    this.calendarDaysByWeek = [];
    this.currentCalendarMonth = month;
    this.currentCalendarYear = year;
    this.calendarHeadMonth = this.months[month - 1];
    this.calendarHeadYear = year.toString();
    var leapYear = this.IsLeapYear(year);
    this.GetPreviousMonthDaysCalendar(month, year, leapYear);
    this.GetCurrentMonthDaysCalendar(month, year, leapYear);
    this.GetNextMonthDaysCalendar(month, year);
  }

  // checks whether the starting month is selected
  MonthIsSelected() {
    this.isMonthErrorVisible = false;
    if (this.selectedMonth == "") this.isMonthErrorVisible = true;
  }

  // checks whether the entered starting year is valid
  YearIsNotValid() {
    this.isYearErrorVisible = false;
    if (this.selectedYear == undefined) this.isYearErrorVisible = true;
    var selectedYearNumber = Number(this.selectedYear);
    if (isNaN(selectedYearNumber)) this.isYearErrorVisible = true;
    if (selectedYearNumber < 1700 || selectedYearNumber >= 2400) this.isYearErrorVisible = true;
  }

  // the starting month and year are selected => show the calendar
  StartingDateSelected() {
    this.MonthIsSelected();
    this.YearIsNotValid();
    if (!this.isMonthErrorVisible && !this.isYearErrorVisible) {
      var month = Number(this.selectedMonth);
      var year = Number(this.selectedYear);
      this.GetSelectedMonthDays(month, year);
      this.GetMonthDaysByWeek();
      this.showCalendar = true;
    }
  }

  // returns true if the entered custom date is valid, otherwise returns false
  // year should be between 1700 and 2399
  // date format must be dd.MM.yyyy
  CheckIfStringIsValidDate(date: string): boolean{
    var regex = /^(0[1-9]|1[0-9]|2[0-9]|3[0-1]).(0[1-9]|1[0-2]).(\d{4})$/; 
    if (!regex.test(date)) {
      return false;
    }
    var data = date.split(".");
    var day = data[0].startsWith("0") ? Number(data[0][1]) : Number(data[0]);
    var month = data[1].startsWith("0") ? Number(data[1][1]) : Number(data[1]);
    var year = Number(data[2]);
    var monthDays = this.daysInMonth[month - 1];
    if (month == 2 && this.IsLeapYear(year)) {
      monthDays += 1;
    }
    if (year < 1700 || year >= 2400) return  false;
    if (day > monthDays) return false;
    return true;
  }

  // an event that is triggered when custom date is entered in the field
  // if the date is valid show update calendar
  // else show error message
  CustomDateSelected() {
    var fullDate = this.customDate;
    if (this.CheckIfStringIsValidDate(fullDate)) {
      this.isCustomDateErrorVisible = false;
      var data = fullDate.split(".");
      var day = data[0].startsWith("0") ? Number(data[0][1]) : Number(data[0]);
      var month = data[1].startsWith("0") ? Number(data[1][1]) : Number(data[1]);
      var year = Number(data[2]);
      this.customSelectedDay = day;
      this.customSelectedMonth = month;
      this.customSelectedYear = year;
      this.GetSelectedMonthDays(month, year);
      this.GetMonthDaysByWeek();
    }
    else {
      this.isCustomDateErrorVisible = true;
    }
  }

  // event that is triggered when previous month button is clicked
  PreviousMonthClicked(){
    this.currentCalendarMonth = this.currentCalendarMonth - 1 == 0 ? this.currentCalendarMonth = 12 : this.currentCalendarMonth - 1;
    this.currentCalendarYear = this.currentCalendarMonth == 12 ? this.currentCalendarYear - 1 : this.currentCalendarYear;
    this.GetSelectedMonthDays(this.currentCalendarMonth, this.currentCalendarYear);
    this.GetMonthDaysByWeek();
  }

  // check if previous month is in range (min year 1700)
  PreviousMonthNotInRange() {
    if (this.currentCalendarMonth == 1 && this.currentCalendarYear == 1700) return true;
    return false;
  }

  // event that is triggered when next month button is clicked
  NextMonthClicked() {
    this.currentCalendarMonth = this.currentCalendarMonth + 1 > 12 ? this.currentCalendarMonth = 1 : this.currentCalendarMonth + 1;
    this.currentCalendarYear = this.currentCalendarMonth == 1 ? this.currentCalendarYear + 1 : this.currentCalendarYear;
    this.GetSelectedMonthDays(this.currentCalendarMonth, this.currentCalendarYear);
    this.GetMonthDaysByWeek();
  }

  // check if next month is in range (max year 2399)
  NextMonthNotInRange() {
    if (this.currentCalendarMonth == 12 && this.currentCalendarYear == 2399) return true;
    return false;
  }

  // close the calendar
  CloseCalendar() {
    this.showCalendar = false;
  }

  // on init function
  ngOnInit() {
    this.ReadHolidaysFromFile();
  }
}
