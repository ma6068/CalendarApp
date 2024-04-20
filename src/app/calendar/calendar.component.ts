import { Component, OnInit  } from '@angular/core';

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
  dayCodes = [1, 2, 3, 4, 5, 6, 0];
  monthCodes = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5]
  centuryCodes = [4, 2, 0, 6, 4, 2, 0] // from 1700s to 2300s

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

  // returns day of the week for given date
  GetDayOfTheWeekFromDate(day: number, month: number, year: number): string {
    var dayCodeIndex = (this.GetYearCode(year) + this.GetMonthCode(month) + this.GetCenturyCode(year) + day - this.GetLeapYearCode(month, year)) % 7;
    var dayIndex = this.dayCodes.indexOf(dayCodeIndex);
    return this.daysInWeek[dayIndex];
  }

  ngOnInit() {
    console.log(this.GetDayOfTheWeekFromDate(1, 1, 2024));
  }
}
