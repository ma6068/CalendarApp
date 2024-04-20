import { Component, OnInit  } from '@angular/core';
import { CalendarDay } from './calendar-day-model';
import { readFileSync } from 'fs';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {

  // global static variables initialization
  daysInWeek = ["Monday", "Tuesday", "WednesDay", "Thursday", "Friday", "Saturday", "Sunday"];
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  dayCodes = [1, 2, 3, 4, 5, 6, 0];
  monthCodes = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5]
  centuryCodes = [4, 2, 0, 6, 4, 2, 0] // from 1700s to 2300s
  numberOfShownDaysInCalendar = 42;
  calendarDays = new Array<CalendarDay>();

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
  GetDayIndexInWeek(day: number, month: number, year: number): number {
    var dayCodeIndex = (this.GetYearCode(year) + this.GetMonthCode(month) + this.GetCenturyCode(year) + day - this.GetLeapYearCode(month, year)) % 7;
    var dayIndex = this.dayCodes.indexOf(dayCodeIndex);
    return dayIndex;
  }

  // returns all days from previous month that should be shown in the calendar
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
          year: previousMonthYear
        };
        this.calendarDays.push(calendarDay);
      }
    }
  }

  // returns all days from current month that should be shown in the calendar
  GetCurrentMonthDaysCalendar(month: number, year: number, leapYear: boolean): void {
    var daysInMonth = this.daysInMonth[month - 1];
    if (month == 2 && leapYear) {
      daysInMonth += 1;
    } 
    for (var i = 1; i <= daysInMonth; i++) {
      var calendarDay: CalendarDay = {
        day: i,
        month: month,
        year: year
      };
      this.calendarDays.push(calendarDay);
    }
  }

  // returns all days from next month that should be shown in the calendar
  GetNextMonthDaysCalendar(month: number, year: number): void {
    var nextMonth = month + 1 == 13 ? 1 : month + 1;
    var nextMonthYear = month + 1 == 13 ? year + 1 : year;
    var numberOfDaysThatNeedToAdd = this.numberOfShownDaysInCalendar - this.calendarDays.length;
    for (var i = 1; i <= numberOfDaysThatNeedToAdd; i++) {
      var calendarDay: CalendarDay = {
        day: i,
        month: nextMonth,
        year: nextMonthYear
      };
      this.calendarDays.push(calendarDay);
    }
  }

  ReadHolidaysFromFile() {
    var file = readFileSync('./src/app/data/holidays.txt', 'utf-8');
    var lines = file.split('\n');
    console.log(lines[1]);
  }

  // returns all days that need to be shown in calendar
  GetSelectedMonthDays(month: number, year: number) {
    this.ReadHolidaysFromFile();
    var leapYear = this.IsLeapYear(year);
    this.GetPreviousMonthDaysCalendar(month, year, leapYear);
    this.GetCurrentMonthDaysCalendar(month, year, leapYear);
    this.GetNextMonthDaysCalendar(month, year);
  }

  ngOnInit() {
    this.GetSelectedMonthDays(2, 2024);
    //console.log(this.calendarDays);
  }
}
