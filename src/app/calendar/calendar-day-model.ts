export interface CalendarDay {
    day: number;
    month: number;
    year: number;
    isHoliday: boolean;
    isSunday: boolean;
    isInCurrentMonth: boolean;
    isSelectedDate: boolean;
}
